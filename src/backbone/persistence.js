// ═══════════════════════════════════════════════════════════════
// BACKBONE: Persistence  |  persistence.js
// Pipeline OS · v4.1.1 · src/backbone/persistence.js
//
// Strategy:
//   1. Debounced continuous write — every state mutation triggers a
//      500ms debounced IDB write. High-frequency edits batch naturally.
//   2. Global autosave — every 3s, flush if dirty (safety net).
//   3. beforeunload — forced synchronous flush using navigator.locks
//      keep-alive pattern to prevent tab kill before IDB completes.
//
// What is persisted: "magnetized" state — full module state dump:
//   { lyricInput, pipelineObj, moduleData, pipeline (defIds+collapsed), savedAt }
//
// The object is reactive and lives in Backbone. Old consolidation
// pattern is dead. No .clear(), .reset(), .destroy() on close.
// ═══════════════════════════════════════════════════════════════

let _dirty = false;
let _debounceTimer = null;
let _globalTimer = null;
let _flushPromise = null;

// ── State capture ───────────────────────────────────────────

/**
 * Capture the full magnetized state of the app.
 * This is what gets written to IDB on every flush.
 */
function captureFullState() {
  const session = window.activeSession;
  if (!session) return null;

  const captureLI = window.captureLIState;

  return {
    lyricInput: captureLI ? captureLI() : null,
    pipelineObj: window.pipelineObj
      ? JSON.parse(JSON.stringify(window.pipelineObj))
      : null,
    moduleData: captureModuleData(),
    pipelineShape: capturePipelineShape(),
    savedAt: new Date().toISOString(),
  };
}

/**
 * Capture module data from all pipeline entries.
 */
function captureModuleData() {
  const pipeline = window.pipeline;
  if (!pipeline?.length) return {};
  const snap = {};
  pipeline.forEach((entry) => {
    if (entry.data && Object.keys(entry.data).length > 0) {
      snap[entry.defId] = JSON.parse(JSON.stringify(entry.data));
    }
  });
  return snap;
}

/**
 * Capture pipeline shape: ordered list of { defId, collapsed }.
 * This allows restoring which modules were open and in what order.
 */
function capturePipelineShape() {
  const pipeline = window.pipeline;
  if (!pipeline?.length) return [];
  return pipeline.map(entry => ({
    defId: entry.defId,
    collapsed: entry.collapsed,
  }));
}

// ── IDB key for current session ────────────────────────────

function stateKey() {
  const s = window.activeSession;
  if (!s) return null;
  return 'pipeline_track_state_' + s.artistId + '_' + s.track;
}

// ── Core flush (async IDB write) ───────────────────────────

/**
 * Flush current state to IndexedDB.
 * Returns a promise that resolves when the write is done.
 */
function flushToIDB() {
  const key = stateKey();
  if (!key) return Promise.resolve();

  const state = captureFullState();
  if (!state) return Promise.resolve();

  _dirty = false;

  // Use dbSet which writes to cache + async IDB
  if (typeof window.dbSet === 'function') {
    window.dbSet(key, state);
  }

  // Also write the active session marker
  if (window.activeSession) {
    window.dbSet('pipeline_active_session', {
      artistId: window.activeSession.artistId,
      track: window.activeSession.track,
      savedAt: state.savedAt,
    });
  }

  // Return a promise that resolves after IDB transaction completes.
  // _idbWrite is fire-and-forget, but we wait a tick for it to enqueue.
  return new Promise(resolve => setTimeout(resolve, 50));
}

// ── Public API ─────────────────────────────────────────────

/**
 * Mark state as dirty. Called by modules after any mutation.
 */
export function markDirty() {
  _dirty = true;
  // Debounced write: flush after 500ms of inactivity
  clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    if (_dirty) flushToIDB();
  }, 500);
}

/**
 * Force immediate persist (bypasses debounce).
 */
export function persistNow() {
  clearTimeout(_debounceTimer);
  flushToIDB();
}

/**
 * Persist module state after a critical mutation.
 * Triggers debounced write.
 */
export function persistModule(idx, reason) {
  markDirty();
}

/**
 * Start global autosave loop (safety net).
 */
export function startAutosave(interval = 3000) {
  if (_globalTimer) clearInterval(_globalTimer);
  _globalTimer = setInterval(() => {
    if (_dirty && window.activeSession) {
      flushToIDB();
    }
  }, interval);
}

/**
 * Stop global autosave.
 */
export function stopAutosave() {
  if (_globalTimer) { clearInterval(_globalTimer); _globalTimer = null; }
}

/**
 * Force save now (alias for external callers).
 */
export function savePipelineSnapshot() {
  persistNow();
}

// ── beforeunload: forced flush with keep-alive ─────────────

function setupBeforeUnload() {
  window.addEventListener('beforeunload', (e) => {
    if (!_dirty && !window.activeSession) return;

    // Strategy: use navigator.locks with ifAvailable to keep the
    // service worker / tab alive long enough for IDB to flush.
    // Fallback: synchronous cache write (dbSet writes to _idbCache
    // instantly, IDB write is async but cache is already updated).

    // 1. Immediate cache write (synchronous — survives even if IDB doesn't finish)
    const key = stateKey();
    if (key) {
      const state = captureFullState();
      if (state && typeof window.dbSet === 'function') {
        window.dbSet(key, state);
        if (window.activeSession) {
          window.dbSet('pipeline_active_session', {
            artistId: window.activeSession.artistId,
            track: window.activeSession.track,
            savedAt: state.savedAt,
          });
        }
      }
    }

    // 2. Keep-alive lock to give IDB time to flush
    if (navigator.locks) {
      navigator.locks.request('ppos_flush', { ifAvailable: true }, async (lock) => {
        if (!lock) return;
        // Hold the lock briefly to let IDB transaction complete
        await new Promise(resolve => setTimeout(resolve, 200));
      }).catch(() => {});
    }
  });
}

// ── Restore: rehydrate module data on track open ───────────

/**
 * Restore module data from saved state into the current pipeline.
 * Called by openTrack after building the pipeline array.
 *
 * @param {object} saved - the full state object from IDB
 */
export function restoreModuleState(saved) {
  if (!saved) return;

  const pipeline = window.pipeline;
  if (!pipeline) return;

  // Restore pipeline shape (which modules were open)
  if (saved.pipelineShape?.length && pipeline.length === 0) {
    saved.pipelineShape.forEach(shape => {
      if (typeof window.makeEntry === 'function') {
        const entry = window.makeEntry(shape.defId);
        entry.collapsed = shape.collapsed;
        pipeline.push(entry);
      }
    });
  }

  // Restore module data into existing pipeline entries
  if (saved.moduleData) {
    pipeline.forEach(entry => {
      if (saved.moduleData[entry.defId]) {
        entry.data = JSON.parse(JSON.stringify(saved.moduleData[entry.defId]));
      }
    });
  }
}

// ── Init ───────────────────────────────────────────────────

setupBeforeUnload();

// ── Expose to window ───────────────────────────────────────
window.persistModule = persistModule;
window.persistNow = persistNow;
window.markDirty = markDirty;
window.startAutosave = startAutosave;
window.stopAutosave = stopAutosave;
window.savePipelineSnapshot = savePipelineSnapshot;
window.restoreModuleState = restoreModuleState;
window.captureFullState = captureFullState;
