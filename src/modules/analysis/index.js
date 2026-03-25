// ═══════════════════════════════════════════════════════════════
// MODULE: Analysis Modules  |  analysis/index.js
// Pipeline OS · v4.1 · src/modules/analysis/index.js
// Re-registers all built-in analysis modules with the new backbone.
// The actual body functions (bodyWizard, bodyPW, bodyHD, etc.)
// remain in the core bundle from shell.html — these entries simply
// forward to them via the _mr proxy.
// ═══════════════════════════════════════════════════════════════

import { registerModule } from '../../backbone/backbone.js';

// All body functions are defined in the core (shell.html js section).
// The backbone proxy merges _mr assignments with the registry,
// so we only need to ensure the defs are registered here for
// getModuleDefs() / resolveContract() to see them.

const ANALYSIS_DEFS = [
  {
    id: 'generator',
    icon: '✍',
    title: 'Lyric Generator',
    subtitle: 'lyrics + prompt · pre-input',
    color: 'var(--accent)',
    preOnly: true,
    contract: { needs: [], delivers: ['lyrics.sections', 'prompt_overall'] },
  },
  {
    id: 'cleaner',
    icon: '⊘',
    title: 'Lyric Cleaner',
    subtitle: 'strips prompt noise',
    color: 'var(--accent)',
    contract: { needs: ['lyrics.sections'], delivers: [] },
  },
  {
    id: 'wizard',
    icon: '✦',
    title: 'Lyric Wizard',
    subtitle: 'full + sections · analysis',
    color: 'var(--purple)',
    contract: { needs: ['lyrics.sections'], delivers: ['analysis.lyricWizard'] },
  },
  {
    id: 'pwizard',
    icon: '⊛',
    title: 'Prompt Wizard',
    subtitle: 'overall + sections · generate',
    color: 'var(--cyan)',
    contract: { needs: ['pipelineObj'], delivers: ['analysis.promptWizard', 'prompt_overall', 'prompts_seccionais'] },
  },
  {
    id: 'hitdet',
    icon: '🔍',
    title: 'Hit Detective',
    subtitle: '3-layer interaction analysis',
    color: 'var(--amber)',
    contract: { needs: ['pipelineObj', 'analysis.lyricWizard', 'analysis.promptWizard'], delivers: ['analysis.hitDetective'] },
  },
  {
    id: 'neganalyzer',
    icon: '⚠',
    title: 'Negative Analyzer',
    subtitle: 'lyrics + prompts flags',
    color: 'var(--red)',
    contract: { needs: ['lyrics.sections', 'prompt_overall', 'prompts_seccionais'], delivers: ['analysis.negativeAnalyzer', 'prompt_overall.negative'] },
  },
  {
    id: 'spotlight',
    icon: '◉',
    title: 'Section Spotlight',
    subtitle: 'section-by-section editor',
    color: 'var(--amber)',
    contract: { needs: ['lyrics.sections', 'prompts_seccionais'], delivers: ['lyrics.sections', 'prompts_seccionais'] },
  },
  {
    id: 'rhymestash',
    icon: '💎',
    title: 'Rhyme Stash',
    subtitle: 'EN · ES · PT',
    color: 'var(--purple)',
    contract: { needs: [], delivers: [] },
  },
  {
    id: 'hitmaker',
    icon: '⚡',
    title: 'Hit Maker',
    subtitle: 'one-click full optimization',
    color: 'var(--green)',
    contract: { needs: ['pipelineObj'], delivers: ['lyrics.sections', 'prompts_seccionais', 'prompt_overall'] },
  },
  {
    id: 'suno',
    icon: '▶',
    title: 'Send to Suno',
    subtitle: 'consolidate · export · count',
    color: 'var(--green)',
    contract: { needs: ['pipelineObj'], delivers: [] },
  },
  {
    id: 'distro',
    icon: '⟐',
    title: 'Upload to Distro',
    subtitle: 'organic crivo · metadata',
    color: 'var(--blue)',
    contract: { needs: [], delivers: [] },
  },
];

// Register each def. Body functions come from the _mr assignments
// in shell.html's core JS (loaded before modules run).
// The backbone proxy will merge them automatically when _mr[id] is assigned.
ANALYSIS_DEFS.forEach(def => registerModule(def, null));
