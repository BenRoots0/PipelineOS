// ═══════════════════════════════════════════════════════════════
// UTILS: Helpers  |  helpers.js
// Pipeline OS · v4.1 · src/utils/helpers.js
// ═══════════════════════════════════════════════════════════════

import { GREEK_MODES, HM_DEFAULT_BARS, SECTION_SHORTCUTS } from './constants.js';

// ── DOM / string utils ────────────────────────────────────────
export function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
export function getEl(id) { return document.getElementById(id); }
export function showToast(msg) {
  const t = getEl('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}
export function objHash(obj) {
  try { return JSON.stringify(obj).length + '|' + JSON.stringify(obj).slice(0, 100); } catch (e) { return ''; }
}
export function objPreview(obj) {
  if (!obj) return '// No object';
  const lines = [];
  if (obj.prompt_overall?.positive) lines.push(`[OVERALL: ${obj.prompt_overall.positive}]`);
  if (obj.prompt_overall?.negative) lines.push(`[NEGATIVE: ${obj.prompt_overall.negative}]`);
  obj.lyrics.sections.forEach(s => {
    const sp = obj.prompts_seccionais?.[s.name];
    const pt = sp?.positive && sp.positive !== '__wizard__' ? `: ${stripSecTag(sp.positive)}` : '';
    lines.push(`[${s.name}${pt}]`);
    if (s.content) lines.push(s.content);
    lines.push('');
  });
  return lines.join('\n').trim();
}

// ── Section detection ─────────────────────────────────────────
export function detectSections(text) {
  const lines = text.split('\n'); const sections = []; let cur = null;
  lines.forEach(line => {
    const m = line.trim().match(/^\[([^\]]+)\]/);
    if (m) {
      if (cur) sections.push(cur);
      const full = m[1]; const ci = full.indexOf(':');
      const name = ci > -1 ? full.slice(0, ci).trim() : full.trim();
      cur = { name, content: '' };
    } else {
      if (!cur) cur = { name: '', content: '' };
      cur.content += (cur.content ? '\n' : '') + line;
    }
  });
  if (cur) sections.push(cur);
  return sections.filter(s => s.name || s.content.trim());
}
export function hasSections(text) { return /\[[^\]]+\]/.test(text); }

// ── Object helpers ────────────────────────────────────────────
export function stripSecTag(s) {
  return s ? s.replace(/^\[[A-Za-z0-9 \-]{1,30}\]\s*/, '').trim() : s;
}
export function stripBarsText(s) {
  return s ? s.replace(/,?\s*\d+\s*bars?\b/gi, '').replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '').trim() : s;
}
export function parseJSON(raw) {
  const s = raw.replace(/```json|```/g, '').trim();
  try { return JSON.parse(s); } catch (e) {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw e;
  }
}
export function sunoFormat(obj) {
  if (!obj) return '';
  let out = '';
  obj.lyrics.sections.forEach(s => {
    const sp = obj.prompts_seccionais?.[s.name];
    const pos = sp?.positive && sp.positive !== '__wizard__' ? stripSecTag(sp.positive) : '';
    const combined = [pos, sp?.techTranslated || ''].filter(Boolean).join(', ');
    const pt = combined ? ': ' + combined : '';
    if (s.name) out += `[${s.name}${pt}]\n`;
    out += s.content + '\n\n';
  });
  return out.trim();
}

// ── Techniques ────────────────────────────────────────────────
export function swingLabel(n) {
  if (!n || n === 0) return '';
  if (n <= 20) return 'subtle swing';
  if (n <= 40) return 'laid-back swing';
  if (n <= 60) return 'medium swing, swung hi-hats';
  if (n <= 80) return 'hard swing';
  return 'shuffle feel';
}
export function translateTechniques(t) {
  if (!t) return '';
  const parts = [];
  if (t.bars) parts.push(t.bars + ' bars');
  if (t.vocal?.length) {
    const vm = { rap:'rap flow', sung:'sung vocals', spoken:'spoken word', adlibs:'ad libs', harmonies:'vocal harmonies', instrumental:'instrumental' };
    t.vocal.forEach(v => parts.push(vm[v] || v));
  }
  if (t.timeFeel) parts.push(t.timeFeel + ' feel');
  const sl = swingLabel(t.swingFeel); if (sl) parts.push(sl);
  if (t.energy) {
    const em = { build:'building energy', sustained:'sustained energy', peak:'peak energy', drop:'energy drop', breakdown:'breakdown' };
    parts.push(em[t.energy] || t.energy);
  }
  if (t.feel?.length) { t.feel.forEach(v => parts.push(v)); }
  return parts.join(', ');
}
export function hmDefaultBars(name) { return HM_DEFAULT_BARS[name.toLowerCase()] || 4; }

// ── Syntax highlighting ───────────────────────────────────────
export function syntaxHL(text) {
  if (!text) return `<span style="color:var(--muted);opacity:.4">Paste lyrics here...\n\n[Verse 1]\nline\n\n[Chorus]\nline</span>`;
  return text.split('\n').map(line => {
    const t = line.trim();
    const m = t.match(/^\[([^\]]+)\]/);
    if (m) {
      const f = m[1]; const ci = f.indexOf(':');
      if (ci > -1) return `<span style="color:var(--cyan)">[<span style="font-weight:500">${esc(f.slice(0, ci))}</span><span style="color:var(--muted);font-style:italic">${esc(f.slice(ci))}</span>]</span>`;
      const sp = window.getSectionDisplayPrompt ? window.getSectionDisplayPrompt(f) : '';
      if (sp && sp !== '__wizard__') return `<span style="color:var(--cyan)">[<span style="font-weight:500">${esc(f)}</span><span style="color:var(--muted);font-style:italic">: ${esc(sp)}</span>]</span>`;
      return `<span style="color:var(--cyan);font-weight:500">[${esc(f)}]</span>`;
    }
    if (!t) return `<span>&nbsp;</span>`;
    return `<span>${esc(line)}</span>`;
  }).join('\n');
}

// ── Lyric cleaner ─────────────────────────────────────────────
export function cleanLyrics(text, opts) {
  const { doMerge = true, maxLen = 40 } = opts || {};
  const rawSecs = detectSections(text);
  const seen = new Map();
  const sections = rawSecs.map(s => {
    const norm = s.content.trim().toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(norm)) return { ...s, dupe: true, dupeOf: seen.get(norm) };
    if (s.name) seen.set(norm, s.name);
    let lines = s.content.split('\n').map(l => l.trim()).filter(l => l);
    if (doMerge) {
      const merged = []; let buf = '';
      lines.forEach(l => {
        if (buf && (buf + ' ' + l).length <= maxLen) { buf += '\n' + l; }
        else { if (buf) merged.push(buf); buf = l; }
      });
      if (buf) merged.push(buf);
      lines = merged;
    }
    return { ...s, lines, dupe: false };
  });
  return { sections };
}
export function buildPlain(sections) {
  return sections.filter(s => !s.dupe).map(s => `[${s.name}]\n${s.lines.join('\n')}`).join('\n\n');
}

// Expose all to window
window.esc = esc;
window.getEl = getEl;
window.showToast = showToast;
window.objHash = objHash;
window.objPreview = objPreview;
window.detectSections = detectSections;
window.hasSections = hasSections;
window.stripSecTag = stripSecTag;
window.stripBarsText = stripBarsText;
window.parseJSON = parseJSON;
window.sunoFormat = sunoFormat;
window.swingLabel = swingLabel;
window.translateTechniques = translateTechniques;
window.hmDefaultBars = hmDefaultBars;
window.syntaxHL = syntaxHL;
window.cleanLyrics = cleanLyrics;
window.buildPlain = buildPlain;
