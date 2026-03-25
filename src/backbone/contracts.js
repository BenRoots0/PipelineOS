// ═══════════════════════════════════════════════════════════════
// BACKBONE: Contracts  |  contracts.js
// Pipeline OS · v4.1 · src/backbone/contracts.js
// Contract type definitions and resolution helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Standard contract slot names (used in module `needs` / `delivers` arrays).
 * Having them in one place prevents typos across modules.
 */
export const SLOTS = {
  // Lyric Input writes these
  PIPELINE_OBJ:       'pipelineObj',
  LYRICS_SECTIONS:    'lyrics.sections',
  PROMPT_OVERALL:     'prompt_overall',
  PROMPTS_SECCIONAIS: 'prompts_seccionais',
  META:               'meta',

  // Analysis modules write these
  LYRIC_WIZARD:       'analysis.lyricWizard',
  PROMPT_WIZARD:      'analysis.promptWizard',
  HIT_DETECTIVE:      'analysis.hitDetective',
  NEG_ANALYZER:       'analysis.negativeAnalyzer',
  FEEDLOOP:           'analysis.feedloop',
};

/**
 * Resolve dot-notation keys from pipelineObj.
 * e.g. resolveContract(obj, ['lyrics.sections', 'meta'])
 * → { 'lyrics.sections': [...], meta: {...} }
 *
 * @param {object|null} pipelineObj
 * @param {string[]} needs  - array of dot-notation keys
 * @returns {object} resolved slice
 */
export function resolveContract(pipelineObj, needs) {
  if (!pipelineObj || !needs?.length) return {};
  const result = {};
  for (const key of needs) {
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

// Expose to window
window.SLOTS = SLOTS;
window.resolveContract = resolveContract;
