// ═══════════════════════════════════════════════════════════════
// ENTRY POINT: Pipeline OS v4.1  |  src/main.js
// Imports are ordered by dependency: constants → storage → utils
// → services → backbone → modules
// esbuild bundles this as an IIFE and injects into pipeline.html
// ═══════════════════════════════════════════════════════════════

// ── Layer 1: Constants ──────────────────────────────────────────
import './utils/constants.js';

// ── Layer 2: Storage / IndexedDB ───────────────────────────────
import './services/storage.js';

// ── Layer 3: Utilities ─────────────────────────────────────────
import './utils/audio.js';
import './utils/helpers.js';

// ── Layer 4: Services ──────────────────────────────────────────
import './services/api.js';
import './services/supabase.js';

// ── Layer 5: Backbone / Contracts / Persistence ─────────────
import './backbone/contracts.js';
import './backbone/backbone.js';
import './backbone/persistence.js';

// ── Layer 6: Module definitions ───────────────────────────────
// Lyric input (source-of-truth, not a pipeline[] module)
import './modules/lyric/index.js';

// Built-in analysis module defs (bodies come from shell core via _mr proxy)
import './modules/analysis/index.js';

// External modules (full body + def, self-registering)
import './modules/feedloop/index.js';
import './modules/hitscore/index.js';
import './modules/sunobuilder/index.js';
import './modules/text2prompter/index.js';
import './modules/cover/index.js';

// ── Layer 7: Wire renderModules to shell render() ──────────────
// shell.html core defines render() and calls setRenderFn after DOMContentLoaded.
// Nothing to do here — shell.html will call window.setRenderFn(render) itself.
