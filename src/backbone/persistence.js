// ═══════════════════════════════════════════════════════════════
// BACKBONE: Persistence  |  persistence.js
// Pipeline OS · v4.1 · src/backbone/persistence.js
//
// Two-layer persistence:
//   A) Granular: persistModule(idx) — called by modules after critical mutations
//   B) Global autosave: every N seconds, snapshot full pipeline state to IndexedDB
//
// Both layers use core's dbSet (from shell.html) via window reference.
// ═══════════════════════════════════════════════════════════════

let _autosaveTimer = null;
let _dirty = false;

/**
 * Mark the pipeline as dirty (needs save).
 * Called by modules after mutating pipeline[idx].data
 */
export function markDirty() {
  _dirty = true;
}

/**
 * Persist current track state to IndexedDB immediately.
 * Uses the same key format as core JS: pipeline_track_state_{artistId}_{track}
 */
export function persistNow() {
  const session = window.activeSession;
  if (!session) return;

  const captureLI = window.captureLIState;
  if (!captureLI) return;

  const state = {
    lyricInput: captureLI(),
    pipelineObj: window.pipelineObj ? JSON.parse(JSON.stringify(window.pipelineObj)) : null,
    moduleData: captureModuleData(),
    savedAt: new Date().toISOString(),
  };

  window.dbSet(
    'pipeline_track_state_' + session.artistId + '_' + session.track,
    state
  );
  _dirty = false;
}

/**
 * Capture all module data from pipeline[] for persistence.
 */
function captureModuleData() {
  const pipeline = window.pipeline;
  if (!pipeline?.length) return {};
  const snap = {};
  pipeline.forEach((entry, idx) => {
    if (entry.data && Object.keys(entry.data).length > 0) {
      snap[entry.defId || idx] = JSON.parse(JSON.stringify(entry.data));
    }
  });
  return snap;
}

/**
 * Persist module state after a critical mutation.
 * Call this from module event handlers after changing pipeline[idx].data
 *
 * @param {number} idx - pipeline index
 * @param {string} [reason] - optional label for debug
 */
export function persistModule(idx, reason) {
  markDirty();
  // Debounce: persist after 500ms of inactivity (batches rapid changes)
  clearTimeout(_autosaveTimer);
  _autosaveTimer = setTimeout(() => {
    if (_dirty) persistNow();
  }, 500);
}

/**
 * Start the global autosave loop.
 * Runs every `interval` ms, persists only if dirty.
 *
 * @param {number} interval - ms between checks (default 3000)
 */
let _globalTimer = null;
export function startAutosave(interval = 3000) {
  if (_globalTimer) clearInterval(_globalTimer);
  _globalTimer = setInterval(() => {
    if (_dirty && window.activeSession) {
      persistNow();
    }
  }, interval);
}

/**
 * Stop the global autosave loop.
 */
export function stopAutosave() {
  if (_globalTimer) { clearInterval(_globalTimer); _globalTimer = null; }
}

/**
 * Force save now (e.g. before session close).
 */
export function savePipelineSnapshot() {
  persistNow();
}

// Expose to window
window.persistModule = persistModule;
window.persistNow = persistNow;
window.markDirty = markDirty;
window.startAutosave = startAutosave;
window.stopAutosave = stopAutosave;
window.savePipelineSnapshot = savePipelineSnapshot;
