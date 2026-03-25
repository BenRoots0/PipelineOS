// ═══════════════════════════════════════════════════════════════
// MODULE: Feedback Loop  |  feedloop/index.js
// Pipeline OS · v4.1 · src/modules/feedloop/index.js
// ═══════════════════════════════════════════════════════════════

import { registerModule } from '../../backbone/backbone.js';

// ── Module contract ───────────────────────────────────────────
const def = {
  id: 'feedloop',
  icon: '↺',
  title: 'Feedback Loop',
  subtitle: 'post-generation · iterate',
  color: 'var(--cyan)',
  contract: {
    needs: ['pipelineObj'],
    delivers: ['analysis.feedloop'],
  },
};

// ── Body ──────────────────────────────────────────────────────
function bodyFeedLoop(idx) {
  const p = window.pipeline[idx]; if (!p.data) p.data = {};
  const d = p.data;
  const activeTab = d.flTab || 'log';
  let h = `<div class="mod-tabs"><button class="mod-tab${activeTab === 'log' ? ' active' : ''}" onclick="flTab(${idx},'log')">📋 Listen Log</button><button class="mod-tab${activeTab === 'synthesis' ? ' active' : ''}" onclick="flTab(${idx},'synthesis')">🔮 AI Synthesis</button><button class="mod-tab${activeTab === 'history' ? ' active' : ''}" onclick="flTab(${idx},'history')">🕐 Run History</button></div>`;
  // Listen Log tab
  h += `<div class="mod-tab-pane${activeTab === 'log' ? ' active' : ''}">`;
  const rating = d.rating || 0;
  h += `<div style="padding:14px 16px 0">`;
  h += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;"><div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Overall Feel</div><div style="display:flex;gap:2px;">${[1,2,3,4,5].map(n=>`<button onclick="flRate(${idx},${n})" style="font-size:18px;background:none;border:none;cursor:pointer;opacity:${rating>=n?1:.2};padding:0 2px;transition:opacity .15s">${rating>=n?'★':'☆'}</button>`).join('')}</div>${rating?`<span style="font-size:9px;color:var(--amber);font-family:'Syne',sans-serif;font-weight:700">${rating}/5</span>`:''}</div>`;
  h += `<div style="margin-bottom:10px"><label style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--green)">What worked 🟢</label><textarea class="li-input" style="height:72px;margin-top:4px" placeholder="Ex: chorus energy felt right, flow in Verse 1 was natural, overall vibe matched the brief…" oninput="flUpdate(${idx},'worked',this.value)">${esc(d.worked||'')}</textarea></div>`;
  h += `<div style="margin-bottom:10px"><label style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--red)">What to change 🔴</label><textarea class="li-input" style="height:72px;margin-top:4px" placeholder="Ex: bridge too long, pre-chorus vocals too complex, overall prompt too vague, missing the grit…" oninput="flUpdate(${idx},'tochange',this.value)">${esc(d.tochange||'')}</textarea></div>`;
  h += `<div style="margin-bottom:14px"><label style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)">Suno URL (optional)</label><input class="li-input" style="height:34px;margin-top:4px" type="text" placeholder="https://suno.com/song/..." value="${esc(d.sunoUrl||'')}" oninput="flUpdate(${idx},'sunoUrl',this.value)"></div>`;
  h += `</div>`;
  h += `<div style="padding:10px 16px 14px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:center;"><button class="m-btn m-btn-ai" onclick="runFeedLoop(${idx})" ${!window.pipelineObj?'disabled':''}>↺ Synthesize Iteration Plan</button>${!window.pipelineObj?'<span style="font-size:10px;color:var(--muted)">Lock pipeline first</span>':''}</div>`;
  h += `</div>`;
  // Synthesis tab
  h += `<div class="mod-tab-pane${activeTab === 'synthesis' ? ' active' : ''}">`;
  if (d.flSynth) { h += renderFLSynth(d.flSynth, idx); }
  else { h += `<div style="padding:36px 16px;text-align:center;color:var(--muted);font-size:11px">Fill the Listen Log tab, then click <strong>Synthesize Iteration Plan</strong>.</div>`; }
  h += `</div>`;
  // History tab
  h += `<div class="mod-tab-pane${activeTab === 'history' ? ' active' : ''}">`;
  const hist = d.flHistory || [];
  if (hist.length) {
    h += `<div style="padding:12px 16px;">`;
    hist.slice().reverse().forEach((run, ri) => {
      const rn = hist.length - ri;
      const stars = [1,2,3,4,5].map(n => n <= (run.rating||0) ? '★' : '☆').join('');
      h += `<div style="border:1px solid var(--border);border-radius:5px;padding:10px 12px;margin-bottom:8px;">`;
      h += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:var(--text2)">Run ${rn}</span><span style="color:var(--amber);letter-spacing:1px;font-size:12px">${stars}</span><span style="font-size:9px;color:var(--muted);margin-left:auto">${esc(run.date||'')}</span></div>`;
      if (run.worked) h += `<div style="font-size:10px;color:var(--green);margin-bottom:3px;line-height:1.4">🟢 ${esc(run.worked.length>130?run.worked.substring(0,130)+'…':run.worked)}</div>`;
      if (run.tochange) h += `<div style="font-size:10px;color:var(--red);line-height:1.4">🔴 ${esc(run.tochange.length>130?run.tochange.substring(0,130)+'…':run.tochange)}</div>`;
      h += `</div>`;
    });
    h += `</div>`;
  } else {
    h += `<div style="padding:36px 16px;text-align:center;color:var(--muted);font-size:11px">No runs logged yet.<br>Synthesize your first iteration to build history.</div>`;
  }
  h += `</div>`;
  return h;
}

function flTab(idx, tab) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  p.data.flTab = tab;
  const mod = window.getEl('module-' + idx); if (!mod) return;
  const tabs = mod.querySelectorAll('.mod-tab');
  const panes = mod.querySelectorAll('.mod-tab-pane');
  const order = ['log', 'synthesis', 'history'];
  const ti = order.indexOf(tab);
  tabs.forEach((t, i) => t.classList.toggle('active', i === ti));
  panes.forEach((pn, i) => pn.classList.toggle('active', i === ti));
}
function flUpdate(idx, field, val) { const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {}; p.data[field] = val; }
function flRate(idx, n) { const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {}; p.data.rating = n; window.renderModules(); }

function renderFLSynth(synth, idx) {
  if (!synth) return '';
  let h = `<div style="padding:14px 16px;">`;
  if (synth._loading) { h += `<div style="text-align:center;padding:24px 0;color:var(--muted);font-size:11px">↺ Analyzing feedback…</div>`; h += `</div>`; return h; }
  if (synth.summary) h += `<div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:16px;padding:10px 14px;border:1px solid var(--border2);border-radius:6px;background:var(--surface2)">${esc(synth.summary)}</div>`;
  const sections = [
    { key:'lyric_changes', label:'Lyric Changes', color:'var(--accent)' },
    { key:'prompt_changes', label:'Overall Prompt Changes', color:'var(--cyan)' },
    { key:'section_changes', label:'Section Prompt Changes', color:'var(--amber)' },
    { key:'structural_changes', label:'Structural Changes', color:'var(--purple)' },
  ];
  sections.forEach(sec => {
    const items = synth[sec.key]; if (!items?.length) return;
    h += `<div style="margin-bottom:14px;"><div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${sec.color};margin-bottom:6px">${sec.label}</div>`;
    items.forEach(item => { h += `<div style="font-size:11px;color:var(--text2);padding:5px 0;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:flex-start;line-height:1.45"><span style="color:${sec.color};flex-shrink:0;margin-top:1px">→</span><span>${esc(item)}</span></div>`; });
    h += `</div>`;
  });
  if (synth.next_step) h += `<div style="margin:8px 0 14px;padding:8px 12px;background:rgba(200,255,87,.06);border:1px solid rgba(200,255,87,.2);border-radius:5px;font-size:11px;color:var(--accent);line-height:1.5">🎯 <strong>Next step:</strong> ${esc(synth.next_step)}</div>`;
  h += `<div style="display:flex;gap:8px;border-top:1px solid var(--border);padding-top:12px;"><button class="m-btn m-btn-ghost" onclick="flCopySynth(${idx})">⎘ Copy as Note</button><button class="m-btn m-btn-ghost" onclick="runFeedLoop(${idx})" style="margin-left:auto">↺ Re-run</button></div>`;
  h += `</div>`;
  return h;
}

async function runFeedLoop(idx) {
  const key = window.getKey(); if (!key) { window.showToast('API key required'); return; }
  if (!window.pipelineObj) { window.showToast('Lock pipeline first'); return; }
  const p = window.pipeline[idx]; if (!p.data) p.data = {};
  const d = p.data;
  if (!d.worked && !d.tochange) { window.showToast('Fill in what worked / what to change first'); return; }
  if (!d.flHistory) d.flHistory = [];
  d.flHistory.push({ date: new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}), rating: d.rating||0, worked: d.worked||'', tochange: d.tochange||'' });
  if (d.flHistory.length > 12) d.flHistory.shift();
  d.flTab = 'synthesis'; d.flSynth = { _loading: true };
  window.renderModules();
  const obj = window.pipelineObj;
  const sections = (obj.lyrics?.sections || []).map(s => s.name).join(', ');
  const overallPrompt = obj.prompt_overall?.positive || window.LI.promptOverall || '';
  const sysPrompt = `You are a music production iteration analyst. Given post-generation listening feedback, produce a concrete actionable iteration plan for the next Suno AI generation attempt. Respond in English only. Return only valid JSON.`;
  const userMsg = `Track: "${obj.meta?.name||'untitled'}"
Style: ${obj.meta?.style||''}
Sections: ${sections}
Overall Prompt: ${overallPrompt}
Rating: ${d.rating||0}/5

WHAT WORKED:
${d.worked||(d.rating>=4?'(good generation overall)':'(nothing noted)')}

WHAT TO CHANGE:
${d.tochange||'(nothing noted)'}
${d.sunoUrl?'\nReference: '+d.sunoUrl:''}

Return JSON with these fields (only include arrays that have items):
{
  "summary": "1-2 sentence synthesis of what this next iteration should focus on",
  "lyric_changes": ["specific change to lyrics"],
  "prompt_changes": ["specific change to overall prompt"],
  "section_changes": ["[SectionName]: specific change to that section prompt"],
  "structural_changes": ["any structural section order/length change"],
  "next_step": "the single highest-impact action to take"
}`;
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', { method:'POST', headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}, body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:900, system:sysPrompt, messages:[{role:'user',content:userMsg}] }) });
    const data = await resp.json();
    const raw = data.content?.[0]?.text || '{}';
    const jm = raw.match(/\{[\s\S]*\}/);
    d.flSynth = jm ? JSON.parse(jm[0]) : { summary:'Could not parse AI response.', lyric_changes:[], prompt_changes:[], section_changes:[], structural_changes:[] };
    if (window.pipelineObj) { if (!window.pipelineObj.analysis) window.pipelineObj.analysis = {}; window.pipelineObj.analysis.feedloop = d.flSynth; }
    window.showToast('↺ Iteration plan ready');
  } catch (e) {
    d.flSynth = { summary:'Error: '+(e.message||'unknown'), lyric_changes:[], prompt_changes:[], section_changes:[], structural_changes:[] };
    window.showToast('Error running feedback synthesis');
  }
  window.renderModules(); window.triggerAutosave('lyric');
}

function flCopySynth(idx) {
  const d = window.pipeline[idx]?.data; if (!d?.flSynth) return;
  const s = d.flSynth;
  const lines = ['=== FEEDBACK LOOP — ITERATION PLAN ===', ''];
  if (s.summary) lines.push(s.summary, '');
  const map = { lyric_changes:'LYRIC CHANGES', prompt_changes:'PROMPT CHANGES', section_changes:'SECTION CHANGES', structural_changes:'STRUCTURAL CHANGES' };
  Object.entries(map).forEach(([k, lbl]) => { if (s[k]?.length) { lines.push(lbl+':'); s[k].forEach(i => lines.push('  → '+i)); lines.push(''); } });
  if (s.next_step) lines.push('NEXT STEP: '+s.next_step);
  navigator.clipboard.writeText(lines.join('\n')).then(() => window.showToast('Copied!')).catch(() => window.showToast('Copy failed'));
}

// ── Self-registration ─────────────────────────────────────────
registerModule(def, bodyFeedLoop);

// Expose event handlers to window (called from inline HTML)
window.flTab = flTab;
window.flUpdate = flUpdate;
window.flRate = flRate;
window.runFeedLoop = runFeedLoop;
window.flCopySynth = flCopySynth;

// helper alias used inside body
function esc(s) { return window.esc(s); }
