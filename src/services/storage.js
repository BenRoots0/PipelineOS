// ═══════════════════════════════════════════════════════════════
// SERVICE: Storage  |  storage.js
// Pipeline OS · v4.1 · src/services/storage.js
//
// PASSTHROUGH: Storage functions are defined in core JS (shell.html)
// and initialized by init() before the bundle runs.
// This module does NOT re-define them — it only re-exports
// window references for use by other bundle modules via import.
//
// Why: The bundle IIFE runs AFTER init() has already called
// _idbLoadAll() and populated _idbCache. Re-defining _idbCache
// here would create a new empty object and destroy loaded data.
// ═══════════════════════════════════════════════════════════════

// Re-export references to core-defined globals.
// These are available because core JS (from shell.html) runs first.
export const dbGet              = (...args) => window.dbGet(...args);
export const dbSet              = (...args) => window.dbSet(...args);
export const dbDel              = (...args) => window.dbDel(...args);
export const getArtists         = (...args) => window.getArtists(...args);
export const saveArtists        = (...args) => window.saveArtists(...args);
export const getProjects        = (...args) => window.getProjects(...args);
export const saveProjects       = (...args) => window.saveProjects(...args);
export const logEntry           = (...args) => window.logEntry(...args);
export const migrateFromLocalStorage = (...args) => window.migrateFromLocalStorage(...args);

// No window.* assignments — core JS already owns these globals.
