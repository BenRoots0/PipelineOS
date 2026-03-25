// ═══════════════════════════════════════════════════════════════
// UTILS: Constants  |  constants.js
// Pipeline OS · v4.1 · src/utils/constants.js
// ═══════════════════════════════════════════════════════════════

export const PPOS_VERSION = '4.1.0';
export const FADE = 500;

export const SECTION_SHORTCUTS = {
  'intro':'Intro',
  'v1':'Verse 1','verse1':'Verse 1','verse 1':'Verse 1',
  'v2':'Verse 2','verse2':'Verse 2','verse 2':'Verse 2',
  'v3':'Verse 3','verse3':'Verse 3',
  'v4':'Verse 4','verse4':'Verse 4',
  'verse':'Verse',
  'cho':'Chorus','ch':'Chorus','chorus':'Chorus',
  'cho1':'Chorus 1','ch1':'Chorus 1','chorus1':'Chorus 1','chorus 1':'Chorus 1',
  'cho2':'Chorus 2','ch2':'Chorus 2','chorus 2':'Chorus 2',
  'cho3':'Chorus 3','ch3':'Chorus 3',
  'pc':'Pre-Chorus','pre':'Pre-Chorus','prechorus':'Pre-Chorus','pre-chorus':'Pre-Chorus','pre chorus':'Pre-Chorus',
  'post':'Post-Chorus','postchorus':'Post-Chorus','post-chorus':'Post-Chorus','post chorus':'Post-Chorus',
  'bridge':'Bridge','br':'Bridge',
  'break':'Break','brk':'Break',
  'outro':'Outro','out':'Outro',
  'hook':'Hook',
  'refrain':'Refrain','ref':'Refrain',
  'inst':'Instrumental','instrumental':'Instrumental',
  'drop':'Drop',
  'build':'Build-Up','buildup':'Build-Up','build-up':'Build-Up',
  'solo':'Solo','spoken':'Spoken',
  'adlib':'Ad-lib','ad lib':'Ad-lib',
  'interlude':'Interlude','inter':'Interlude',
};

export const GREEK_MODES = {
  major:[
    {v:'ionian',l:'Ionian (Natural Major)'},
    {v:'lydian',l:'Lydian (raised ♯4)'},
    {v:'mixolydian',l:'Mixolydian (dom. ♭7)'}
  ],
  minor:[
    {v:'aeolian',l:'Aeolian (Natural Minor)'},
    {v:'dorian',l:'Dorian (raised ♮6)'},
    {v:'phrygian',l:'Phrygian (♭2 dark)'},
    {v:'phrygian_dom',l:'Phrygian Dominant (Spanish/Flamenco)'},
    {v:'locrian',l:'Locrian (dim. ♭2♭5)'}
  ]
};

export const HM_DEFAULT_BARS = {
  intro:4, verse:8, chorus:8, 'pre-chorus':4, 'post-chorus':4,
  bridge:4, break:2, outro:4, hook:8, instrumental:8
};

export const HANDBOOK_DATA = {
  'lyric':{name:'Lyric Input',icon:'✍️',color:'var(--accent)',desc:'The source module. Enter lyrics with [Section] tags, overall style prompt, BPM, key, time signature. Lock to create the pipeline object.',reads:[],writes:['pipelineObj (creates via buildObj)'],creates:['lyrics.sections','prompt_overall','prompts_seccionais','meta'],requires:[]},
  'cleaner':{name:'Lyric Cleaner',icon:'🧹',color:'var(--text2)',desc:'Paste cleanup utility. Removes extra whitespace, normalizes formatting, fixes common paste artifacts. Does not modify the pipeline object.',reads:['raw text input'],writes:[],creates:[],requires:[]},
  'wizard':{name:'Lyric Wizard',icon:'🔮',color:'var(--purple)',desc:'AI-powered lyric analysis across 7 modes: poetic, rhythm, imagery, structure, hit score, metric, and free. Scores your lyrics and provides detailed suggestions per section.',reads:['lyrics.sections'],writes:['analysis.lyricWizard.full','analysis.lyricWizard.sections'],creates:['scores per mode','section suggestions','strengths/weaknesses'],requires:['Locked LI','lyrics in object']},
  'pwizard':{name:'Prompt Wizard',icon:'🎯',color:'var(--cyan)',desc:'AI prompt generator and validator. Creates or evaluates section-level Suno prompts. Modes: Generator (from scratch), Validator (score existing), Artist Align (match style).',reads:['full pipelineObj','analysis.promptWizard'],writes:['prompt_overall.positive','prompts_seccionais[*].positive','analysis.promptWizard'],creates:['overall prompt','section prompts','validation scores'],requires:['Locked LI']},
  'hitdet':{name:'Hit Detective',icon:'🕵️',color:'var(--amber)',desc:'4-layer analysis: lyrics, prompts, interaction, and negatives. Detects conflicts between lyrics and prompts, scores synergy, identifies risks. Best results when Wizard + Prompt Wizard ran first.',reads:['full pipelineObj','analysis.lyricWizard','analysis.promptWizard','prompt_overall.negative'],writes:['analysis.hitDetective.full','analysis.hitDetective.sections'],creates:['4-layer scores','conflict/synergy notes','fix suggestions'],requires:['Locked LI','Wizard + PW recommended']},
  'neganalyzer':{name:'Negative Analyzer',icon:'⊘',color:'var(--red)',desc:'Scans lyrics and prompts for risks: belting triggers, long notes, cliches, filler, vague terms. Suggests negative prompt entries to prevent Suno from generating unwanted content.',reads:['lyrics.sections','prompt_overall','prompts_seccionais'],writes:['analysis.negativeAnalyzer','prompt_overall.negative'],creates:['risk flags','suggested negatives'],requires:['Locked LI']},
  'spotlight':{name:'Spotlight',icon:'🔦',color:'var(--green)',desc:'Section-by-section editor. View lyrics and prompts per section with live analysis summaries from Wizard, Prompt Wizard, and Hit Detective. Edit inline.',reads:['lyrics.sections','prompts_seccionais','all analysis.*'],writes:['lyrics.sections[*].content','prompts_seccionais[*].positive'],creates:[],requires:['Locked LI']},
  'hitmaker':{name:'Hit Maker',icon:'⚡',color:'var(--amber)',desc:'2-pass AI rewrite engine. Pass 1: analyzes issues across all lyrics and prompts. Pass 2: rewrites everything for maximum hit potential. Saves original for comparison.',reads:['full pipelineObj','artist style','creative direction'],writes:['lyrics.sections[*].content','prompts_seccionais[*].positive','prompt_overall.positive'],creates:['full rewrite','predicted score'],requires:['Locked LI','all analyses recommended']},
  'suno':{name:'Suno Export',icon:'🎵',color:'var(--accent)',desc:'Formats the final object for Suno. Displays formatted lyrics with section prompts, overall style prompt, and negatives. Copy or generate directly.',reads:['full pipelineObj','analysis (summary cards)','meta'],writes:[],creates:['formatted Suno output'],requires:['Locked LI']},
  'feedloop':{name:'Feed Loop',icon:'🔄',color:'var(--blue)',desc:'Post-generation iteration module. Rate the Suno output (1-5), note what worked and what to change. AI synthesizes an iteration plan with specific changes to lyrics, prompts, and structure.',reads:['pipelineObj (context)','user feedback'],writes:['analysis.feedloop'],creates:['iteration plan','change suggestions'],requires:['Locked LI']},
  'hitscore':{name:'Hit Score Checklist',icon:'📊',color:'var(--purple)',desc:'66 criteria from Spotify 1M+ streams research across 9 categories. Manual checklist — check items as you verify them. Shows overall score and critical criteria score. Displays lyrics reference panel when available.',reads:['lyrics.sections','meta (bpm, key)'],writes:[],creates:['manual score (0-100)'],requires:['Object for lyrics reference']},
  'sunobuilder':{name:'Suno Prompt Builder',icon:'🎛️',color:'var(--accent)',desc:'Visual keyword picker with all Suno-interpretable variables. 13 sections: genre, BPM, key, mood, vocal, instruments, structure, tempo feel, mix, energy, reference, texture, production, negatives. Auto-syncs BPM/key from object if available.',reads:['meta.bpm','meta.key','meta.timeSig'],writes:[],creates:['keyword prompt (≤1000 chars)'],requires:[]},
  'text2prompter':{name:'Text to Prompter',icon:'🎯',color:'var(--cyan)',desc:'AI-assisted keyword analysis. Enter up to 3 reference songs — Claude API analyzes them and returns Suno-compatible keywords. Detects conflicts between contradictory tags. Results can be applied directly to Suno Prompt Builder.',reads:['reference song names (user input)'],writes:[],creates:['AI-generated keywords','conflict detection'],requires:['Claude API key']},
};

// Expose to window for legacy compatibility
window.PPOS_VERSION = PPOS_VERSION;
window.FADE = FADE;
window.SECTION_SHORTCUTS = SECTION_SHORTCUTS;
window.GREEK_MODES = GREEK_MODES;
window.HM_DEFAULT_BARS = HM_DEFAULT_BARS;
window.HANDBOOK_DATA = HANDBOOK_DATA;
