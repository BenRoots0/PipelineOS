// ═══════════════════════════════════════════════════════════════
// MODULE: Hit Score Checklist  |  hitscore.js
// Pipeline OS · module file · loads via build.sh concatenation
// 66 criteria from Spotify 1M+ streams research
// ═══════════════════════════════════════════════════════════════

const HS_CATEGORIES = [
  { id:"duration", emoji:"⏱️", title:"DURATION & TIMING", color:"var(--amber)", items:[
    { id:"d1", text:"Duration between 2:30 and 3:30 min (ideal stream zone)", critical:true },
    { id:"d2", text:"Never exceed 4:00 min (high skip risk)", critical:true },
    { id:"d3", text:"Hook/chorus appears before 45 seconds", critical:true },
    { id:"d4", text:"First 30 seconds are irresistible (Spotify royalty threshold)", critical:true },
    { id:"d5", text:"Intro doesn't exceed 10-15 seconds", critical:false },
    { id:"d6", text:"No long silence or skip-inviting sections", critical:false },
  ]},
  { id:"structure", emoji:"🏗️", title:"SONG STRUCTURE", color:"var(--purple)", items:[
    { id:"s1", text:"Follows: Intro → Verse → Pre-Chorus → Chorus → Verse → Pre-Chorus → Chorus → Bridge → Final Chorus", critical:true },
    { id:"s2", text:"Chorus appears at least 3 times", critical:true },
    { id:"s3", text:"Each verse has different lyrics (same melody)", critical:false },
    { id:"s4", text:"Pre-chorus (lift) creates tension and anticipation", critical:false },
    { id:"s5", text:"Bridge exists and offers contrast (new lyrical and musical angle)", critical:false },
    { id:"s6", text:"Final chorus has more energy than previous ones (build-up)", critical:false },
    { id:"s7", text:"Outro is a chorus fade-out or condensed version", critical:false },
  ]},
  { id:"hook", emoji:"🪝", title:"HOOK & CHORUS", color:"var(--red)", items:[
    { id:"h1", text:"Hook has max 1-2 short, memorable phrases", critical:true },
    { id:"h2", text:"Song title is in the chorus (1st or last line)", critical:true },
    { id:"h3", text:"Can be hummed effortlessly after 1st listen", critical:true },
    { id:"h4", text:"Chorus synthesizes the emotional theme in few words", critical:true },
    { id:"h5", text:"Hook creates earworm (phrase that sticks in the head)", critical:true },
    { id:"h6", text:"Simple, accessible vocabulary — no obscure jargon", critical:false },
    { id:"h7", text:"Has a 'surprise phrase' or melodic twist in the chorus", critical:false },
  ]},
  { id:"lyrics", emoji:"✍️", title:"LYRICS & CONTENT", color:"var(--green)", items:[
    { id:"l1", text:"Universal theme: love, loss, identity, overcoming, party or freedom", critical:true },
    { id:"l2", text:"Lyrics evoke strong emotion (joy, pain, anger or euphoria)", critical:true },
    { id:"l3", text:"Lyrics are specific in verse details but generic in chorus", critical:false },
    { id:"l4", text:"Uses conversational language (how we actually talk)", critical:false },
    { id:"l5", text:"Has strong visual and sensory imagery (not just abstractions)", critical:false },
    { id:"l6", text:"Listener can IDENTIFY or PROJECT themselves into the story", critical:true },
    { id:"l7", text:"Lyric rhythm fits naturally into the beat (not forced)", critical:false },
    { id:"l8", text:"Verse 2 deepens or advances Verse 1 narrative", critical:false },
    { id:"l9", text:"Bridge offers new perspective or emotional twist", critical:false },
    { id:"l10", text:"Avoids worn-out clichés — or subverts them originally", critical:false },
  ]},
  { id:"audio", emoji:"🎛️", title:"AUDIO CHARACTERISTICS", color:"var(--amber)", items:[
    { id:"a1", text:"BPM between 90–130 (highest danceability and energy zone)", critical:true },
    { id:"a2", text:"High danceability (above 0.65 on Spotify scale)", critical:false },
    { id:"a3", text:"High energy (above 0.65 on Spotify scale)", critical:false },
    { id:"a4", text:"Major key for positive/energetic feeling", critical:false },
    { id:"a5", text:"Loudness between -6 and -4 dB (ideal streaming compression)", critical:false },
    { id:"a6", text:"Moderate speechiness: 4-10%", critical:false },
    { id:"a7", text:"Low instrumentalness (vocal present and dominant)", critical:true },
    { id:"a8", text:"Medium-high valence (mood between neutral and positive)", critical:false },
    { id:"a9", text:"4/4 time signature (practically universal in hits)", critical:true },
    { id:"a10", text:"Studio recorded (low liveness — doesn't sound live)", critical:false },
  ]},
  { id:"production", emoji:"🎚️", title:"MUSIC PRODUCTION", color:"var(--blue)", items:[
    { id:"p1", text:"Clean production, professionally mastered for streaming", critical:true },
    { id:"p2", text:"Beat/rhythm is the first element that 'hooks' the listener", critical:false },
    { id:"p3", text:"Arrangement grows progressively — doesn't give everything at once", critical:false },
    { id:"p4", text:"Clear contrast between verse (restrained) and chorus (full)", critical:true },
    { id:"p5", text:"Uses at least one distinctive/iconic sonic element", critical:false },
    { id:"p6", text:"No frequencies that tire headphone listeners", critical:false },
    { id:"p7", text:"Lead vocal is loud and clear in the mix", critical:false },
    { id:"p8", text:"Drop or emotional 'release' moment well-marked", critical:false },
    { id:"p9", text:"Sound aligned with target genre but with authorial difference", critical:false },
  ]},
  { id:"melody", emoji:"🎵", title:"MELODY & HARMONY", color:"var(--purple)", items:[
    { id:"m1", text:"Main melody is singable (fits average human voice)", critical:true },
    { id:"m2", text:"Chorus is in a higher note than the verse (creates emotional lift)", critical:true },
    { id:"m3", text:"Chord progression is familiar but not too obvious", critical:false },
    { id:"m4", text:"Uses harmonic tension-resolution (creates and releases expectation)", critical:false },
    { id:"m5", text:"Chorus melody can be easily hummed/whistled", critical:true },
    { id:"m6", text:"Has at least one 'surprise note' that marks the song", critical:false },
    { id:"m7", text:"No unintentional aggressive dissonances", critical:false },
  ]},
  { id:"virality", emoji:"📱", title:"VIRAL & PLATFORM POTENTIAL", color:"var(--cyan)", items:[
    { id:"v1", text:"Has a perfect 15-second snippet for TikTok/Reels", critical:true },
    { id:"v2", text:"Hook provokes emotional reaction that incentivizes sharing", critical:true },
    { id:"v3", text:"Beat invites movement (danceable or head-bob)", critical:false },
    { id:"v4", text:"Has challenge, choreography or meme potential", critical:false },
    { id:"v5", text:"Title is short, memorable and easy to search", critical:false },
    { id:"v6", text:"Song works well EVEN with screen off/no visual attention", critical:false },
    { id:"v7", text:"Suitable for mood playlists (workout, sad, party, romance)", critical:false },
  ]},
  { id:"emotional", emoji:"💥", title:"EMOTIONAL IMPACT", color:"var(--green)", items:[
    { id:"e1", text:"Song provokes a SPECIFIC and intense emotion, not generic", critical:true },
    { id:"e2", text:"Has a 'goosebumps' moment — emotional peak that marks", critical:true },
    { id:"e3", text:"Listener wants to replay immediately after it ends", critical:true },
    { id:"e4", text:"Creates sense of belonging or community ('this song is mine')", critical:false },
    { id:"e5", text:"Emotional narrative has arc: tension → climax → resolution", critical:false },
    { id:"e6", text:"Lyrics have line(s) the listener will want to post/quote", critical:false },
  ]},
];

const HS_TOTAL = HS_CATEGORIES.flatMap(c => c.items).length;
const HS_CRITICAL = HS_CATEGORIES.flatMap(c => c.items).filter(i => i.critical).length;

function hsScoreColor(s) {
  if (s >= 85) return 'var(--green)';
  if (s >= 65) return 'var(--amber)';
  return 'var(--red)';
}

function hsScoreLabel(s) {
  if (s >= 90) return '🔥 READY FOR HIT';
  if (s >= 75) return '✅ GOOD PATH';
  if (s >= 55) return '⚠️ NEEDS ADJUSTMENT';
  return '❌ STILL A DRAFT';
}

function bodyHitScore(idx) {
  const p = pipeline[idx]; if (!p.data) p.data = {};
  const d = p.data;
  if (!d.hsChecked) d.hsChecked = {};
  if (!d.hsFilter) d.hsFilter = 'all';
  if (!d.hsLyricsOpen) d.hsLyricsOpen = false;
  if (!d.hsCatOpen) d.hsCatOpen = {};
  const checked = d.hsChecked;
  const filter = d.hsFilter;

  // ── Read lyrics from pipelineObj or injected obj ──
  const obj = d.obj || (typeof pipelineObj !== 'undefined' ? pipelineObj : null);
  const sections = obj?.lyrics?.sections || [];
  const hasLyrics = sections.some(s => s.content && s.content.trim());
  const meta = obj?.meta || {};

  const checkedTotal = Object.values(checked).filter(Boolean).length;
  const checkedCritical = HS_CATEGORIES.flatMap(c => c.items).filter(i => i.critical && checked[i.id]).length;
  const score = Math.round((checkedTotal / HS_TOTAL) * 100);
  const critScore = Math.round((checkedCritical / HS_CRITICAL) * 100);

  let h = '';

  // ── Lyrics reference panel ──
  if (hasLyrics) {
    h += `<div style="padding:10px 16px;background:rgba(167,139,250,.06);border-bottom:1px solid var(--border);">`;
    h += `<div onclick="hsTogLyrics(${idx})" style="display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;">`;
    h += `<span style="font-size:9px;color:var(--muted);transition:transform .2s;${d.hsLyricsOpen?'transform:rotate(180deg)':''}">▼</span>`;
    h += `<span style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--purple)">LYRICS REFERENCE</span>`;
    h += `<span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted)">${sections.filter(s=>s.name).length} sections</span>`;
    if (meta.bpm) h += `<span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--accent);margin-left:auto">${meta.bpm} BPM</span>`;
    if (meta.key) h += `<span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--green);margin-left:4px">${esc(meta.key)}</span>`;
    h += `</div>`;
    if (d.hsLyricsOpen) {
      const secPrompts = obj?.prompts_seccionais || {};
      h += `<div style="margin-top:8px;max-height:200px;overflow-y:auto;font-family:'DM Mono',monospace;font-size:10px;line-height:1.7;color:var(--text2);white-space:pre-wrap;">`;
      sections.forEach(s => {
        if (s.name) {
          const sp = secPrompts[s.name];
          const prompt = sp?.positive && sp.positive !== '__wizard__' ? sp.positive : '';
          h += `<span style="color:var(--accent);font-weight:500">[${esc(s.name)}${prompt ? ': ' + esc(prompt) : ''}]</span>\n`;
        }
        if (s.content) h += esc(s.content) + '\n\n';
      });
      h += `</div>`;
    }
    h += `</div>`;
  } else {
    h += `<div style="padding:10px 16px;background:rgba(255,85,85,.06);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;">`;
    h += `<span style="font-size:11px;color:var(--red)">⚠</span>`;
    h += `<span style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--red)">NO LYRICS</span>`;
    h += `<span style="font-size:10px;color:var(--muted)">Lock Lyric Input & send ↓ to feed lyrics here</span>`;
    h += `</div>`;
  }

  // ── Score cards ──
  h += `<div style="padding:14px 16px;display:flex;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--border);">`;
  h += `<div style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;">`;
  h += `<div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Overall Score</div>`;
  h += `<div style="font-size:28px;font-weight:700;color:${hsScoreColor(score)};line-height:1.2">${score}%</div>`;
  h += `<div style="font-size:10px;color:var(--text2)">${checkedTotal}/${HS_TOTAL} criteria</div></div>`;

  h += `<div style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;">`;
  h += `<div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Critical Criteria</div>`;
  h += `<div style="font-size:28px;font-weight:700;color:${hsScoreColor(critScore)};line-height:1.2">${critScore}%</div>`;
  h += `<div style="font-size:10px;color:var(--text2)">${checkedCritical}/${HS_CRITICAL} essential</div></div>`;

  h += `<div style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 14px;">`;
  h += `<div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Status</div>`;
  h += `<div style="font-size:14px;font-weight:700;color:${hsScoreColor(critScore)};margin-top:4px">${hsScoreLabel(critScore)}</div>`;
  h += `<div style="font-size:10px;color:var(--text2)">Target: critical &gt; 85%</div></div>`;
  h += `</div>`;

  // ── Filter bar ──
  h += `<div style="padding:10px 16px;display:flex;gap:8px;align-items:center;border-bottom:1px solid var(--border);">`;
  h += `<span style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Filter:</span>`;
  h += `<button class="m-btn m-btn-ghost" style="font-size:9px;padding:3px 10px;${filter==='all'?'border-color:var(--accent);color:var(--accent)':''}" onclick="hsFilter(${idx},'all')">All</button>`;
  h += `<button class="m-btn m-btn-ghost" style="font-size:9px;padding:3px 10px;${filter==='critical'?'border-color:var(--red);color:var(--red)':''}" onclick="hsFilter(${idx},'critical')">🔴 Critical Only</button>`;
  h += `<button class="m-btn m-btn-ghost" style="font-size:9px;padding:3px 10px;margin-left:auto;" onclick="hsReset(${idx})">↺ Reset</button>`;
  h += `</div>`;

  // ── Categories ──
  h += `<div style="padding:8px 16px 16px;max-height:60vh;overflow-y:auto;">`;
  HS_CATEGORIES.forEach(cat => {
    const items = filter === 'critical' ? cat.items.filter(i => i.critical) : cat.items;
    if (!items.length) return;
    const catChecked = cat.items.filter(i => checked[i.id]).length;
    const catPct = Math.round((catChecked / cat.items.length) * 100);

    const catOpen = d.hsCatOpen[cat.id] === true;
    h += `<div style="border:1px solid ${catChecked>0?cat.color+'44':'var(--border)'};border-radius:6px;margin-bottom:8px;overflow:hidden;">`;
    // cat header (clickable to collapse)
    h += `<div onclick="hsCatToggle(${idx},'${cat.id}')" style="padding:10px 14px;display:flex;align-items:center;gap:10px;background:var(--surface2);cursor:pointer;user-select:none;${catOpen?'border-bottom:1px solid var(--border)':''}">`;
    h += `<span style="font-size:16px">${cat.emoji}</span>`;
    h += `<span style="font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.08em;color:${cat.color}">${cat.title}</span>`;
    h += `<div style="margin-left:auto;display:flex;align-items:center;gap:8px;">`;
    h += `<div style="width:60px;height:3px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${catPct}%;background:${cat.color};border-radius:2px;transition:width .3s"></div></div>`;
    h += `<span style="font-family:'DM Mono',monospace;font-size:10px;color:${catPct===100?cat.color:'var(--muted)'}">${catChecked}/${cat.items.length}</span>`;
    h += `<span style="font-size:9px;color:var(--muted);transition:transform .2s;${catOpen?'transform:rotate(180deg)':''}">▼</span>`;
    h += `</div></div>`;

    // items (collapsible)
    if (catOpen) {
      items.forEach(item => {
        const isOn = !!checked[item.id];
        h += `<div onclick="hsToggle(${idx},'${item.id}')" style="display:flex;align-items:flex-start;gap:10px;padding:8px 14px;cursor:pointer;transition:background .15s;${isOn?'background:'+cat.color+'0a':''}" onmouseover="this.style.background=this.style.background||'var(--surface2)'" onmouseout="this.style.background='${isOn?cat.color+'0a':''}'">`;
        h += `<div style="width:16px;height:16px;border-radius:4px;border:2px solid ${isOn?cat.color:'var(--border2)'};background:${isOn?cat.color:'transparent'};flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;">`;
        if (isOn) h += `<svg width="9" height="7" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="#0b0b0e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        h += `</div>`;
        h += `<span style="font-size:12px;color:${isOn?'var(--text2)':'var(--text)'};line-height:1.5;flex:1;${isOn?'text-decoration:line-through':''}">${esc(item.text)}</span>`;
        if (item.critical) h += `<span style="font-size:9px;color:var(--red);border:1px solid rgba(255,85,85,.3);border-radius:3px;padding:1px 6px;font-family:'Syne',sans-serif;font-weight:700;letter-spacing:.06em;flex-shrink:0;margin-top:2px">CRITICAL</span>`;
        h += `</div>`;
      });
    }
    h += `</div>`;
  });

  // ── Footer note ──
  h += `<div style="margin-top:10px;padding:12px 14px;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15);border-radius:6px;">`;
  h += `<div style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--purple);margin-bottom:6px">📌 HOW TO USE</div>`;
  h += `<div style="font-size:11px;color:var(--text2);line-height:1.6">Start with <strong style="color:var(--red)">CRITICAL criteria</strong> — they have the biggest impact on streams. A critical score <strong style="color:var(--green)">above 85%</strong> indicates strong performance potential. Non-critical criteria differentiate good songs from <em>great hits</em>.</div>`;
  h += `</div>`;
  h += `</div>`;

  return h;
}

function hsToggle(idx, itemId) {
  const p = pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  if (!p.data.hsChecked) p.data.hsChecked = {};
  p.data.hsChecked[itemId] = !p.data.hsChecked[itemId];
  renderModules(); triggerAutosave('lyric');
}

function hsCatToggle(idx, catId) {
  const p = pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  if (!p.data.hsCatOpen) p.data.hsCatOpen = {};
  p.data.hsCatOpen[catId] = !p.data.hsCatOpen[catId];
  renderModules();
}

function hsTogLyrics(idx) {
  const p = pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  p.data.hsLyricsOpen = !p.data.hsLyricsOpen;
  renderModules();
}

function hsFilter(idx, filter) {
  const p = pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  p.data.hsFilter = filter;
  renderModules();
}

function hsReset(idx) {
  const p = pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  p.data.hsChecked = {};
  renderModules(); triggerAutosave('lyric');
}

// ── Self-registration ────────────────────────────────────────
_mr['hitscore'] = bodyHitScore;
MODULE_DEFS.push({ id:'hitscore', icon:'📊', title:'Hit Score Checklist', subtitle:'66 criteria · Spotify 1M+ research', color:'var(--purple)' });
