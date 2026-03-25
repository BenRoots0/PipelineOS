// ═══════════════════════════════════════════════════════════════
// BACKBONE: Contracts  |  contracts.js
// Pipeline OS · v4.1.1 · src/backbone/contracts.js
//
// Module contracts define what each module needs and delivers.
// LI (Module 0) delivers raw-source ONLY. Backbone distributes
// downstream slices to consumers.
//
// Lyric Prep and Suno Cleaner remain SEPARATE:
//   - Lyric Prep = pre-production (AI/Prompts)
//   - Suno Cleaner = post-production (UI/clean output)
// ═══════════════════════════════════════════════════════════════

/**
 * Standard contract slot names.
 * Used in module `needs` / `delivers` arrays.
 */
export const SLOTS = {
  // LI (Module 0) delivers this single source-of-truth
  RAW_SOURCE:         'raw-source',       // { lyricInput, pipelineObj }

  // Backbone distributes these slices from raw-source
  PIPELINE_OBJ:       'pipelineObj',
  LYRICS_SECTIONS:    'lyrics.sections',
  PROMPT_OVERALL:     'prompt_overall',
  PROMPTS_SECCIONAIS: 'prompts_seccionais',
  META:               'meta',

  // Analysis modules deliver these
  LYRIC_WIZARD:       'analysis.lyricWizard',
  PROMPT_WIZARD:      'analysis.promptWizard',
  HIT_DETECTIVE:      'analysis.hitDetective',
  NEG_ANALYZER:       'analysis.negativeAnalyzer',
  FEEDLOOP:           'analysis.feedloop',
  HIT_SCORE:          'analysis.hitScore',

  // Suno Builder delivers
  SUNO_PROMPT:        'sunoPrompt',
};

/**
 * Module contract definitions.
 * Each module declares what it needs and what it delivers.
 *
 * LI is Module 0, entry point. It delivers raw-source only.
 * Backbone resolves needs → delivers chains automatically.
 */
export const MODULE_CONTRACTS = {
  lyric: {
    needs: [],
    delivers: SLOTS.RAW_SOURCE,
    description: 'Lyric Input — source of truth. Delivers raw-source (lyrics + pipelineObj).',
  },
  // Pre-production (AI analysis + prompts) — SEPARATE from Suno Cleaner
  generator: {
    needs: [SLOTS.LYRICS_SECTIONS],
    delivers: SLOTS.LYRICS_SECTIONS,
    description: 'Lyric Prep — AI-assisted pre-production.',
  },
  // Post-production (clean output) — SEPARATE from Lyric Prep
  cleaner: {
    needs: [SLOTS.LYRICS_SECTIONS, SLOTS.PROMPTS_SECCIONAIS],
    delivers: null,
    description: 'Suno Cleaner — post-production clean output. Read-only.',
  },
  wizard: {
    needs: [SLOTS.LYRICS_SECTIONS, SLOTS.META],
    delivers: SLOTS.LYRIC_WIZARD,
    description: 'Lyric Wizard — AI lyric analysis.',
  },
  pwizard: {
    needs: [SLOTS.PIPELINE_OBJ],
    delivers: SLOTS.PROMPT_WIZARD,
    description: 'Prompt Wizard — AI prompt analysis.',
  },
  hitdetective: {
    needs: [SLOTS.PIPELINE_OBJ],
    delivers: SLOTS.HIT_DETECTIVE,
    description: 'Hit Detective — commercial viability analysis.',
  },
  neganalyzer: {
    needs: [SLOTS.LYRICS_SECTIONS, SLOTS.PROMPTS_SECCIONAIS],
    delivers: SLOTS.NEG_ANALYZER,
    description: 'Negative Analyzer — identifies negative patterns.',
  },
  feedloop: {
    needs: [SLOTS.PIPELINE_OBJ],
    delivers: SLOTS.FEEDLOOP,
    description: 'Feed Loop — iteration synthesis.',
  },
  hitscore: {
    needs: [SLOTS.LYRICS_SECTIONS],
    delivers: SLOTS.HIT_SCORE,
    description: 'Hit Score Checklist — manual + AI analysis. Read-only (does not modify object).',
  },
  sunobuilder: {
    needs: [SLOTS.META],
    delivers: SLOTS.SUNO_PROMPT,
    description: 'Suno Prompt Builder — keyword picker for overall + sectional prompts.',
  },
  cover: {
    needs: [],
    delivers: null,
    description: 'Cover module — reference placeholder.',
  },
};

/**
 * Resolve dot-notation keys from pipelineObj.
 * e.g. resolveContract(obj, ['lyrics.sections', 'meta'])
 * → { 'lyrics.sections': [...], meta: {...} }
 */
export function resolveContract(pipelineObj, needs) {
  if (!pipelineObj || !needs?.length) return {};
  const result = {};
  for (const key of needs) {
    if (key === SLOTS.RAW_SOURCE) {
      // raw-source is the full object — only LI delivers this
      result[key] = pipelineObj;
      continue;
    }
    const parts = key.split('.');
    let val = pipelineObj;
    for (const part of parts) {
      if (val == null) { val = undefined; break; }
      val = val[part];
    }
    result[key] = val;
  }
  return result;
}

/**
 * Get contract for a module by id.
 */
export function getContract(moduleId) {
  return MODULE_CONTRACTS[moduleId] || null;
}

// Expose to window
window.SLOTS = SLOTS;
window.MODULE_CONTRACTS = MODULE_CONTRACTS;
window.resolveContract = resolveContract;
window.getContract = getContract;
