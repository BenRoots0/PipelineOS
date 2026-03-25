// ═══════════════════════════════════════════════════════════════
// BACKBONE: Registry  |  backbone.js
// Pipeline OS · v4.1 · src/backbone/backbone.js
//
// IMPORTANT: Core JS (shell.html) defines MODULE_DEFS (array) and
// _mr (object) BEFORE this bundle runs. We must NOT replace them.
// Instead, we AUGMENT the existing globals and add new modules
// into the same data structures the core already uses.
// ═══════════════════════════════════════════════════════════════

import { resolveContract } from './contracts.js';

// ── References to core-defined globals ──────────────────────
// These already exist and are populated by core JS.
const _coreDefs = window.MODULE_DEFS;  // the original array
const _coreMr   = window._mr;          // the original plain object

/**
 * Register a module (new backbone API).
 * Adds to the EXISTING core MODULE_DEFS array and _mr object.
 * This ensures core JS render functions find the module.
 *
 * @param {object} def  - { id, icon, title, subtitle, color, preOnly?, contract? }
 * @param {function} bodyFn  - (idx) => HTML string
 */
export function registerModule(def, bodyFn) {
  // Add to MODULE_DEFS if not already there
  if (_coreDefs && !_coreDefs.find(d => d.id === def.id)) {
    _coreDefs.push(def);
  }
  // Register body function in _mr
  if (_coreMr && bodyFn) {
    _coreMr[def.id] = bodyFn;
  }
}

/** Return ordered array of all module definitions. */
export function getModuleDefs() { return _coreDefs || []; }

/** Return the body function for a module id, or null. */
export function getModuleBody(id) { return _coreMr?.[id] || null; }

/** Re-export resolveContract for convenience. */
export { resolveContract };

// ── renderModules alias ───────────────────────────────────────
// Many modules call renderModules() — alias to the main render() function.
// render() is defined in core JS. We wire it via setRenderFn.
let _renderFn = null;
export function setRenderFn(fn) { _renderFn = fn; }
export function renderModules() { if (_renderFn) _renderFn(); }

// ── Expose NEW functions to window (don't clobber existing) ──
window.registerModule   = registerModule;
window.getModuleDefs    = getModuleDefs;
window.getModuleBody    = getModuleBody;
window.resolveContract  = resolveContract;
window.renderModules    = renderModules;
window.setRenderFn      = setRenderFn;
// NOTE: window.MODULE_DEFS and window._mr are NOT reassigned.
// They keep their original values from core JS.
