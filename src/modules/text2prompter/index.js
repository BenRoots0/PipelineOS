// ═══════════════════════════════════════════════════════════════
// MODULE: Text to Prompter (beta)  |  text2prompter/index.js
// Pipeline OS · v4.1 · src/modules/text2prompter/index.js
// AI-assisted keyword picker — reference songs → Suno keywords
// ═══════════════════════════════════════════════════════════════

import { registerModule } from '../../backbone/backbone.js';
import { SB_SECTIONS } from '../sunobuilder/index.js';

// ── Module contract ───────────────────────────────────────────
const def = {
  id: 'text2prompter',
  icon: '🎯',
  title: 'Text to Prompter',
  subtitle: 'AI reference analysis · beta',
  color: 'var(--cyan)',
  contract: {
    needs: [],
    delivers: [],
  },
};

// ── Constants ─────────────────────────────────────────────────
const T2P_MAX_REFS = 3;

const T2P_CONFLICTS = [
  [['calm','peaceful','serene','meditative'],['explosive','aggressive','intense','energetic','driving']],
  [['no vocals','instrumental'],['male vocals','female vocals','duet','choir','belting','falsetto']],
  [['slow tempo','rubato'],['fast tempo','driving','double-time feel']],
  [['lo-fi texture','lo-fi home recording','bedroom recording'],['hi-fi polished','studio recording','clean digital clarity']],
  [['dark and heavy','dark ambient','somber'],['joyful','euphoric','celebratory','cheerful','feel-good']],
  [['sparse and minimalist','minimalist sparse'],['wall of sound','dense and layered','maximum density on final chorus']],
  [['no drums','no heavy drums'],['drum machine','live drum kit','808 drums','four-on-the-floor kick']],
  [['acoustic guitar','acoustic indie','acoustic pop'],['no acoustic guitar']],
  [['electric guitar','overdriven guitar'],['no electric guitar']],
  [['piano','grand piano','upright piano'],['no piano']],
  [['no synth'],['synth pads','analog synth','synth arpeggios','lead synth']],
  [['dry vocals upfront','dry and direct'],['wide reverb','heavy reverb','deep reverb on everything']],
  [['cold ending','no outro'],['fade out ending']],
  [['under 2 minutes'],['over 4 minutes']],
];

function esc(s) { return window.esc(s); }

function t2pDetectConflicts(keywords) {
  const found = [];
  const flat = keywords.map(k => k.toLowerCase());
  T2P_CONFLICTS.forEach(([groupA, groupB]) => {
    const matchA = groupA.filter(a => flat.some(k => k.includes(a.toLowerCase())));
    const matchB = groupB.filter(b => flat.some(k => k.includes(b.toLowerCase())));
    if (matchA.length && matchB.length) found.push({ a: matchA, b: matchB });
  });
  return found;
}

function t2pBuildSystemPrompt() {
  return `You are a music analysis expert specializing in Suno AI prompt engineering.

Given reference songs/artists, analyze their musical characteristics and return Suno-compatible keywords.

Return ONLY valid JSON with this exact structure:
{
  "genre": ["keyword1", "keyword2"],
  "bpm": "number",
  "time_sig": "4/4",
  "key": ["key description"],
  "mood": ["mood1", "mood2"],
  "vocal": ["vocal style1"],
  "inst": ["instrument1", "instrument2"],
  "struct": ["full structure string"],
  "tempo_feel": ["feel1"],
  "mix": ["mix characteristic1"],
  "energy": ["energy curve description"],
  "ref": ["reference feel1"],
  "texture": ["texture1"],
  "prod": ["production detail1"],
  "neg": ["things to exclude"]
}

Rules:
- Use ONLY keywords that Suno AI can interpret
- Be specific and descriptive
- For multiple references, merge characteristics intelligently
- Include negative prompts for things that should be avoided
- Keep total output under 800 characters when joined
- If songs have contrasting styles, note this in your analysis`;
}

function t2pBuildUserPrompt(refs) {
  let prompt = 'Analyze these reference songs and return Suno-compatible keywords:\n\n';
  refs.forEach((r, i) => { prompt += `Reference ${i + 1}: ${r}\n`; });
  prompt += '\nReturn ONLY the JSON object, no explanation.';
  return prompt;
}

// ── Body ──────────────────────────────────────────────────────
function bodyText2Prompter(idx) {
  const p = window.pipeline[idx]; if (!p.data) p.data = {};
  const d = p.data;
  if (!d.t2pRefs) d.t2pRefs = ['', '', ''];
  if (!d.t2pResult) d.t2pResult = null;
  if (!d.t2pConflicts) d.t2pConflicts = [];
  if (!d.t2pLoading) d.t2pLoading = false;
  if (!d.t2pError) d.t2pError = '';
  if (d.t2pApplied === undefined) d.t2pApplied = false;

  const apiKey = localStorage.getItem('ppos_claude_api_key') || '';
  let h = '';

  if (!apiKey) {
    h += `<div style="padding:20px 16px;">`;
    h += `<div style="background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.2);border-radius:8px;padding:16px;">`;
    h += `<div style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--purple);margin-bottom:8px">🔑 CLAUDE API KEY REQUIRED</div>`;
    h += `<div style="font-size:11px;color:var(--text2);line-height:1.6;margin-bottom:12px">This module uses Claude to analyze reference songs and generate Suno-compatible keywords. Your key is stored locally and never shared.</div>`;
    h += `<div style="display:flex;gap:6px;">`;
    h += `<input type="password" id="t2p-apikey-${idx}" placeholder="sk-ant-..." style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:8px 10px;color:var(--text);font-family:'DM Mono',monospace;font-size:11px;outline:none;">`;
    h += `<button class="m-btn m-btn-primary" onclick="t2pSaveKey(${idx})">Save</button>`;
    h += `</div></div></div>`;
    return h;
  }

  h += `<div style="padding:14px 16px;border-bottom:1px solid var(--border);">`;
  h += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">`;
  h += `<span style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--purple)">REFERENCE SONGS</span>`;
  h += `<button class="m-btn m-btn-ghost" style="font-size:8px;padding:2px 8px;" onclick="t2pClearKey(${idx})">🔑 Change Key</button>`;
  h += `</div>`;
  for (let i = 0; i < T2P_MAX_REFS; i++) {
    h += `<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center;">`;
    h += `<span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);width:14px;text-align:right">${i + 1}.</span>`;
    h += `<input id="t2p-ref-${idx}-${i}" value="${esc(d.t2pRefs[i] || '')}" placeholder="${i === 0 ? 'e.g. Live and Let Die - Paul McCartney' : 'optional reference ' + (i + 1)}" oninput="t2pRefUpd(${idx},${i},this.value)" style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:7px 10px;color:var(--text);font-family:'DM Mono',monospace;font-size:11px;outline:none;">`;
    h += `</div>`;
  }
  const hasRef = d.t2pRefs.some(r => r.trim());
  h += `<div style="margin-top:10px;display:flex;gap:6px;">`;
  h += `<button class="m-btn m-btn-primary" style="flex:1" onclick="t2pAnalyze(${idx})" ${!hasRef || d.t2pLoading ? 'disabled' : ''}>${d.t2pLoading ? '⏳ Analyzing...' : '🔍 Analyze References'}</button>`;
  if (d.t2pResult) h += `<button class="m-btn m-btn-ghost" onclick="t2pReset(${idx})">↺</button>`;
  h += `</div></div>`;

  if (d.t2pError) {
    h += `<div style="padding:10px 16px;background:rgba(255,85,85,.08);border-bottom:1px solid var(--border);">`;
    h += `<span style="font-size:11px;color:var(--red)">${esc(d.t2pError)}</span></div>`;
  }

  if (d.t2pResult) {
    const res = d.t2pResult;
    const allKw = Object.entries(res).flatMap(([k, v]) => Array.isArray(v) ? v : [v]).filter(Boolean);
    const conflicts = t2pDetectConflicts(allKw);

    if (conflicts.length > 0) {
      h += `<div style="padding:12px 16px;background:rgba(245,158,11,.08);border-bottom:1px solid rgba(245,158,11,.2);">`;
      h += `<div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--amber);margin-bottom:8px">⚠️ POTENTIAL CONFLICTS DETECTED</div>`;
      h += `<div style="font-size:11px;color:var(--text2);line-height:1.7;margin-bottom:8px">These keywords may produce unpredictable results in Suno. You can proceed anyway — sometimes contradictions create magic.</div>`;
      conflicts.forEach(c => {
        h += `<div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.15);border-radius:4px;padding:6px 10px;margin-bottom:4px;font-size:10px;">`;
        h += `<span style="color:var(--amber)">⚡</span> `;
        h += `<span style="color:var(--cyan)">${esc(c.a.join(', '))}</span>`;
        h += ` <span style="color:var(--muted)">vs</span> `;
        h += `<span style="color:var(--red)">${esc(c.b.join(', '))}</span>`;
        h += `</div>`;
      });
      h += `</div>`;
    }

    h += `<div style="padding:10px 16px;max-height:40vh;overflow-y:auto;">`;
    const sectionMap = { genre:'Genre', bpm:'BPM', time_sig:'Time Sig', key:'Key', mood:'Mood', vocal:'Vocal', inst:'Instruments', struct:'Structure', tempo_feel:'Tempo Feel', mix:'Mix', energy:'Energy', ref:'Reference Feel', texture:'Texture', prod:'Production', neg:'Negative' };
    const colors = { genre:'var(--purple)', bpm:'var(--accent)', key:'var(--green)', mood:'var(--amber)', vocal:'var(--purple)', inst:'var(--cyan)', struct:'var(--green)', tempo_feel:'var(--amber)', mix:'var(--red)', energy:'var(--green)', ref:'var(--purple)', texture:'var(--red)', prod:'var(--blue)', neg:'var(--red)' };
    Object.entries(res).forEach(([key, val]) => {
      if (!val || (Array.isArray(val) && !val.length)) return;
      const label = sectionMap[key] || key;
      const color = colors[key] || 'var(--muted)';
      const chips = Array.isArray(val) ? val : [String(val)];
      h += `<div style="margin-bottom:8px;">`;
      h += `<span style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${color}">${esc(label)}</span>`;
      h += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">`;
      chips.forEach(c => {
        const isNeg = key === 'neg';
        h += `<span style="padding:3px 9px;border-radius:12px;font-size:10px;border:1px solid ${isNeg ? 'rgba(255,85,85,.3)' : color + '44'};background:${isNeg ? 'rgba(255,85,85,.1)' : color + '12'};color:${isNeg ? 'var(--red)' : color}">${esc(String(c))}</span>`;
      });
      h += `</div></div>`;
    });
    h += `</div>`;

    h += `<div style="padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:6px;">`;
    if (d.t2pApplied) {
      h += `<button class="m-btn m-btn-ghost" style="flex:1" disabled>✓ Applied to Suno Prompter</button>`;
    } else {
      h += `<button class="m-btn m-btn-primary" style="flex:1" onclick="t2pApply(${idx})">✨ Apply to Suno Prompter</button>`;
    }
    h += `<button class="m-btn m-btn-ghost" onclick="t2pCopyJSON(${idx})">⎘ JSON</button>`;
    h += `</div>`;
  }

  return h;
}

// ── Event handlers ────────────────────────────────────────────
function t2pSaveKey(idx) {
  const inp = window.getEl('t2p-apikey-' + idx);
  const key = inp?.value?.trim();
  if (!key || !key.startsWith('sk-ant-')) { window.showToast('Invalid API key format'); return; }
  localStorage.setItem('ppos_claude_api_key', key);
  window.renderModules();
  window.showToast('API key saved');
}

function t2pClearKey(idx) {
  localStorage.removeItem('ppos_claude_api_key');
  window.renderModules();
}

function t2pRefUpd(idx, refIdx, val) {
  const p = window.pipeline[idx]; if (!p?.data) return;
  if (!p.data.t2pRefs) p.data.t2pRefs = ['', '', ''];
  p.data.t2pRefs[refIdx] = val;
}

async function t2pAnalyze(idx) {
  const p = window.pipeline[idx]; if (!p?.data) return;
  const d = p.data;
  const refs = (d.t2pRefs || []).filter(r => r.trim());
  if (!refs.length) { window.showToast('Add at least one reference'); return; }
  const apiKey = localStorage.getItem('ppos_claude_api_key');
  if (!apiKey) { window.showToast('API key not set'); return; }

  d.t2pLoading = true; d.t2pError = ''; d.t2pResult = null; d.t2pApplied = false;
  window.renderModules();

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1024, system:t2pBuildSystemPrompt(), messages:[{ role:'user', content:t2pBuildUserPrompt(refs) }] })
    });
    if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err.error?.message || `API error ${resp.status}`); }
    const data = await resp.json();
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    d.t2pResult = JSON.parse(jsonMatch[0]);
    d.t2pLoading = false;
    window.renderModules();
    window.showToast('Analysis complete');
  } catch (e) {
    d.t2pLoading = false;
    d.t2pError = e.message || 'Unknown error';
    window.renderModules();
  }
}

function t2pApply(idx) {
  const p = window.pipeline[idx]; if (!p?.data?.t2pResult) return;
  const res = p.data.t2pResult;
  const sbIdx = window.pipeline.findIndex(m => m.defId === 'sunobuilder');
  if (sbIdx < 0) { window.showToast('Add Suno Prompt Builder to pipeline first'); return; }
  const sb = window.pipeline[sbIdx];
  if (!sb.data) sb.data = {};
  if (!sb.data.sbVals) {
    sb.data.sbVals = {};
    SB_SECTIONS.forEach(s => { sb.data.sbVals[s.id] = s.type === 'chips' || s.type === 'neg' ? [] : ''; });
    sb.data.sbVals.time_sig = '';
  }
  const V = sb.data.sbVals;
  Object.entries(res).forEach(([key, val]) => {
    if (!val) return;
    if (key === 'bpm') { V.bpm = String(val).replace(/[^\d]/g, ''); return; }
    if (key === 'time_sig') { V.time_sig = String(val); return; }
    if (Array.isArray(val) && val.length && V[key] !== undefined) V[key] = val.map(v => String(v));
  });
  sb.data._synced = true;
  p.data.t2pApplied = true;
  window.renderModules();
  window.showToast('Applied to Suno Prompter ✓');
  const el = window.getEl('module-' + sbIdx);
  if (el) { window.pipeline[sbIdx].collapsed = false; el.classList.remove('collapsed'); el.scrollIntoView({ behavior:'smooth', block:'start' }); }
}

function t2pCopyJSON(idx) {
  const p = window.pipeline[idx]; if (!p?.data?.t2pResult) return;
  navigator.clipboard.writeText(JSON.stringify(p.data.t2pResult, null, 2))
    .then(() => window.showToast('JSON copied'))
    .catch(() => window.showToast('Copy failed'));
}

function t2pReset(idx) {
  const p = window.pipeline[idx]; if (!p?.data) return;
  p.data.t2pResult = null; p.data.t2pConflicts = []; p.data.t2pError = ''; p.data.t2pApplied = false;
  window.renderModules();
}

// ── Self-registration ─────────────────────────────────────────
registerModule(def, bodyText2Prompter);

// Expose to window
window.T2P_MAX_REFS = T2P_MAX_REFS;
window.T2P_CONFLICTS = T2P_CONFLICTS;
window.t2pSaveKey = t2pSaveKey;
window.t2pClearKey = t2pClearKey;
window.t2pRefUpd = t2pRefUpd;
window.t2pAnalyze = t2pAnalyze;
window.t2pApply = t2pApply;
window.t2pCopyJSON = t2pCopyJSON;
window.t2pReset = t2pReset;
