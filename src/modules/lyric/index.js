// ═══════════════════════════════════════════════════════════════
// MODULE: Lyric Input  |  lyric/index.js
// Pipeline OS · v4.1 · src/modules/lyric/index.js
// The Lyric Input is NOT a pipeline[] module — it is the fixed
// source module rendered by makeLIModule() in shell.html.
// This file exports the contract definition for reference and
// exposes it to the backbone so the handbook and resolver work.
// ═══════════════════════════════════════════════════════════════

import { registerModule } from '../../backbone/backbone.js';

// The lyric module has a special id 'lyric' — it is not in pipeline[]
// and its body is rendered by makeLIModule() in the core.
// We register it as a definition-only entry (no body fn needed here).
export const lyricDef = {
  id: 'lyric',
  icon: '⊡',
  title: 'Lyric & Prompt Input',
  subtitle: 'source of truth',
  color: 'var(--accent)',
  contract: {
    needs: [],
    delivers: ['pipelineObj', 'lyrics.sections', 'prompt_overall', 'prompts_seccionais', 'meta'],
  },
};

// NOTE: Do NOT call registerModule() here.
// The lyric module is special — it's rendered by makeLIModule() in core JS,
// not as part of pipeline[]. Adding it to MODULE_DEFS would make it appear
// in the toolbox picker as a duplicate. The contract is exported for
// handbook/resolver reference only.
