// ═══════════════════════════════════════════════════════════════
// MODULE: Suno Prompt Builder  |  sunobuilder/index.js
// Pipeline OS · v4.1 · src/modules/sunobuilder/index.js
// All Suno-interpretable variables — select and compile ≤1000 chars
// ═══════════════════════════════════════════════════════════════

import { registerModule } from '../../backbone/backbone.js';

// ── Module contract ───────────────────────────────────────────
const def = {
  id: 'sunobuilder',
  icon: '🎛️',
  title: 'Suno Prompt Builder',
  subtitle: 'all variables · compile ≤1000 chars',
  color: 'var(--accent)',
  contract: {
    needs: ['meta'],
    delivers: [],
  },
};

// ── Data ──────────────────────────────────────────────────────
export const SB_SECTIONS = [
  { id:'genre', lbl:'GENRE', title:'Genre', c:'var(--purple)', type:'chips', multi:true, groups:[
    { g:'Indie / Alternative', opts:['indie pop','indie rock','indie folk pop','indie folk','dream pop','shoegaze','lo-fi indie','bedroom pop','jangle pop','chamber pop','art pop','coastal pop'] },
    { g:'Electronic', opts:['synth pop','electro pop','new wave','darkwave','synthwave','chillwave','vaporwave','electro swing','ambient electronic','IDM','glitch pop','hyperpop'] },
    { g:'Rock', opts:['classic rock','soft rock','post punk','post punk revival','alternative rock','grunge','garage rock','dance rock','psychedelic rock','prog rock','math rock','emo','surf rock'] },
    { g:'Pop', opts:['pop','teen pop','power pop','tropical pop','bubblegum pop','baroque pop','folk pop','acoustic pop','cinematic pop'] },
    { g:'Folk / Acoustic', opts:['folk','indie folk','americana','country folk','celtic folk','singer-songwriter','acoustic indie','Mediterranean folk','bossa nova','tropicália'] },
    { g:'Jazz / Soul', opts:['jazz','smooth jazz','nu jazz','acid jazz','neo soul','soul','R&B','funk','gospel','blues','swing','electro jazz'] },
    { g:'Hip Hop', opts:['hip hop','trap','lo-fi hip hop','boom bap','cloud rap','drill','afrobeat','afro pop'] },
    { g:'Dance / Electronic', opts:['house','deep house','tech house','progressive house','tropical house','disco','nu disco','funk soul','EDM','trance','drum and bass'] },
    { g:'Ambient / Cinematic', opts:['ambient','dark ambient','cinematic','orchestral','post rock','drone','space ambient','neoclassical','film score'] },
  ]},
  { id:'bpm', lbl:'BPM', title:'Tempo', c:'var(--accent)', type:'bpm' },
  { id:'key', lbl:'KEY', title:'Key', c:'var(--green)', type:'chips', multi:false, groups:[
    { g:'Major Keys', opts:['A major','B major','C major','D major','E major','F major','G major','Bb major','Eb major','Ab major'] },
    { g:'Minor Keys', opts:['A minor','B minor','C minor','D minor','E minor','F minor','G minor','F# minor','C# minor'] },
    { g:'Complex / Tension', opts:['E major, B minor tension','D major, B minor touches','A minor, C major resolution','D minor, F major resolution','G major, E minor touches','C major, A minor tension'] },
  ]},
  { id:'mood', lbl:'MOOD', title:'Mood & Emotion', c:'var(--amber)', type:'chips', multi:true, groups:[
    { g:'Positive', opts:['joyful','euphoric','celebratory','uplifting','triumphant','playful','carefree','cheerful','hopeful','warm','feel-good','nostalgic','bittersweet joy'] },
    { g:'Melancholic', opts:['melancholic','sad','longing','bittersweet','heartbroken','tender','wistful','somber','vulnerable','introspective','reflective','haunting'] },
    { g:'Energetic', opts:['energetic','intense','powerful','urgent','driving','aggressive','anthemic','epic','explosive','electrifying','unstoppable'] },
    { g:'Calm / Atmospheric', opts:['peaceful','serene','dreamy','ethereal','weightless','floating','meditative','hypnotic','mysterious','surreal','cinematic','cinematic without being dramatic'] },
    { g:'Context / Scene', opts:['late night','early morning','open road','coastal','Mediterranean','underwater','rainy day','golden hour','midnight city','campfire','rooftop'] },
  ]},
  { id:'vocal', lbl:'VOCAL', title:'Vocal Style', c:'var(--purple)', type:'chips', multi:true, groups:[
    { g:'Gender & Type', opts:['male vocals','female vocals','mixed vocals','duet','choir','no vocals (instrumental)'] },
    { g:'Tone & Character', opts:['smooth','raspy','breathy','airy','powerful','gritty','tender','warm','dark','bright','rich','thin','husky'] },
    { g:'Delivery Style', opts:['storytelling','conversational','intimate','theatrical','passionate','controlled','whispered','spoken word','melodic rap','belting'] },
    { g:'Range & Technique', opts:['falsetto','head voice','chest voice','wide vocal range','high tenor','baritone','soprano','layered harmonies','close harmonies','backing vocals','call and response'] },
    { g:'Effects', opts:['slight reverb on vocals','dry vocals upfront','tape delay on vocals','vocoder','auto-tune effect','double tracked vocals','lo-fi vocal texture','studio polish'] },
  ]},
  { id:'inst', lbl:'INSTRUMENTS', title:'Instrumentation', c:'var(--cyan)', type:'chips', multi:true, groups:[
    { g:'Guitar', opts:['acoustic guitar','classical guitar fingerpicking','nylon string guitar','electric guitar','clean electric guitar','overdriven guitar','slide guitar','12-string guitar','fingerpicking','strumming','arpeggios','wah-wah guitar','funk guitar','jangly guitar'] },
    { g:'Keys / Piano', opts:['grand piano','upright piano','electric piano','Rhodes piano','Wurlitzer','Hammond organ','harpsichord','honky-tonk piano','prepared piano'] },
    { g:'Synth', opts:['analog synth','modular synth','synth pads','synth arpeggios','lead synth','synth bass','synth strings','Moog','Jupiter-8 style','TB-303 bass'] },
    { g:'Bass', opts:['electric bass','upright bass','slap bass','walking bass','thumb bass','fretless bass','808 bass','synth bass','pulsing bass'] },
    { g:'Drums / Percussion', opts:['live drum kit','drum machine','brushed snare','featherlight drums','staccato drums','shuffling hi-hat','four-on-the-floor kick','808 drums','congas','bongos','tabla','cajon','hand claps','tambourine','marimba','xylophone','vibraphone','steel drums'] },
    { g:'Brass / Wind', opts:['trumpet','muted trumpet','trombone','saxophone','alto sax','tenor sax','flute','clarinet','French horn','brass section','horn stabs'] },
    { g:'Strings', opts:['violin','viola','cello','upright bass','string quartet','string section','pizzicato strings','orchestral strings'] },
    { g:'Other / World', opts:['harp','banjo','mandolin','ukulele','sitar','oud','bouzouki','accordion','harmonica','pedal steel','lap steel','dobro','pan flute','didgeridoo'] },
  ]},
  { id:'struct', lbl:'STRUCTURE', title:'Song Structure', c:'var(--green)', type:'chips', multi:false, groups:[
    { g:'Common Structures', opts:[
      'intro, verse, chorus, verse, chorus, bridge, final chorus, outro',
      'intro, verse, pre-chorus, chorus, verse, pre-chorus, chorus, bridge, final chorus, outro',
      'intro, verse, chorus, verse, chorus, outro',
      'intro, verse, verse, chorus, bridge, chorus, outro',
      'verse, chorus, verse, chorus, bridge, chorus',
    ]},
  ]},
  { id:'tempo_feel', lbl:'TEMPO FEEL', title:'Tempo Feel & Groove', c:'var(--amber)', type:'chips', multi:true, groups:[
    { g:'Groove Style', opts:['straight groove','swing feel','shuffle groove','syncopated','polyrhythmic','half-time feel','double-time feel','rubato','laid-back behind the beat','pushed ahead of the beat'] },
    { g:'Energy Movement', opts:['loose and organic','tight and driving','bouncy and forward','elastic rhythm','hypnotic and repetitive','building momentum','foot-stomping','head-nodding','danceable swagger','breathing between notes'] },
  ]},
  { id:'mix', lbl:'MIX FOCUS', title:'Mix Focus', c:'var(--red)', type:'chips', multi:true, groups:[
    { g:'Volume Balance', opts:['vocals loudest','vocals dry and upfront','instruments behind vocals','guitar leads mix','piano leads mix','bass-forward mix','drums prominent','bass felt not heard'] },
    { g:'Space & Width', opts:['wide stereo field','narrow mono feel','intimate close mix','spacious and open','deep reverb on everything','light reverb on vocals only','dry and direct','room reverb'] },
    { g:'Tone', opts:['warm analog tone','bright and crisp','dark and heavy','soft and smooth','punchy mid-range','bass-heavy','lo-fi texture','hi-fi polished','vintage tape warmth'] },
  ]},
  { id:'energy', lbl:'ENERGY CURVE', title:'Energy Curve', c:'var(--green)', type:'chips', multi:false, groups:[
    { g:'Arc', opts:[
      'sparse intro, builds gradually, explodes on chorus',
      'sparse intro, drum explosion on chorus downbeat',
      'consistently energetic throughout',
      'builds layer by layer each section',
      'full from start, strips on bridge, returns full',
      'calm and steady throughout',
      'quiet verse, loud chorus contrast',
      'maximum energy from start to finish',
      'slow burn — builds over entire track',
    ]},
  ]},
  { id:'ref', lbl:'REFERENCE FEEL', title:'Reference Feel', c:'var(--purple)', type:'chips', multi:true, groups:[
    { g:'Scene / Place', opts:['sunday morning on the coast','driving with windows down','sitting alone at 3am','walking through a city at night','sitting by a campfire','rainy afternoon at home','golden hour on the beach','last night of a long trip','early morning fog'] },
    { g:'Emotional Quality', opts:['melancholic but hopeful','cinematic without being dramatic','nostalgic without being sad','joyful but bittersweet','peaceful but alive','tender and honest','raw and vulnerable','confident and free','mysterious and alluring'] },
    { g:'Era / Aesthetic', opts:['retro yet modern','vintage 70s warmth','80s neon nostalgia','90s lo-fi bedroom','2000s indie aesthetic','timeless and classic','futuristic but warm','analog in a digital world'] },
  ]},
  { id:'texture', lbl:'TEXTURE', title:'Texture & Effects', c:'var(--red)', type:'chips', multi:true, groups:[
    { g:'Overall Texture', opts:['warm and analog','slightly lo-fi','highly polished','raw and unprocessed','organic imperfections','vintage tape saturation','clean digital clarity','sun-bleached warmth','cinematic depth'] },
    { g:'Effects & Processing', opts:['vinyl crackle','tape hiss','wide reverb','short reverb','delay echoes','tape echo','chorus effect','tremolo','phaser','flanger','heavy compression','sidechain pulse','spatial fx'] },
    { g:'Space', opts:['always space between notes','dense and layered','minimalist sparse','wall of sound','intimate bedroom feel','atmospheric and expansive','close and personal'] },
  ]},
  { id:'prod', lbl:'PRODUCTION', title:'Production & Final Details', c:'var(--blue)', type:'chips', multi:true, groups:[
    { g:'Duration', opts:['under 2 minutes','under 3 minutes','under 3 minutes 30 seconds','3 to 4 minutes','over 4 minutes'] },
    { g:'Intro / Outro', opts:['instrumental intro no vocals','cold start no intro','long intro 8+ bars','fade in intro','fade out ending','cold ending','outro instrumental only','no outro'] },
    { g:'Arrangement Details', opts:['sparse to full progressive build','one layer added per section','maximum density on final chorus','drops to minimal on bridge','drum break mid-song','key change on final chorus','half-time break','instrumental solo before final chorus','melancholic piano solo before final chorus','guitar solo'] },
    { g:'Recording Style', opts:['studio recording','live room feel','bedroom recording','lo-fi home recording','orchestral hall recording','intimate acoustic'] },
  ]},
  { id:'neg', lbl:'NEGATIVE', title:'Exclude from Output', c:'var(--red)', type:'neg', groups:[
    { g:'Instruments', opts:['no violin','no strings','no cello','no orchestra','no choir','no harp','no brass','no horns','no flute','no banjo','no accordion','no electric guitar','no acoustic guitar','no piano','no synth'] },
    { g:'Vocals', opts:['no vocals','no female vocals','no male vocals','no auto-tune','no falsetto','no screaming','no rap','no choir','no harmonies'] },
    { g:'Drums / Rhythm', opts:['no heavy drums','no drums in verse','no drum machine','no trap beats','no 808','no electronic beats','no fast tempo','no slow tempo'] },
    { g:'Style / Feel', opts:['no distortion','no heavy metal','no EDM','no dark mood','no sad mood','no upbeat energy','no slow ballad','no generic sound','no filler','no noise','no glitch','no artifacts'] },
    { g:'Mix / Production', opts:['no loud mix','no buried vocals','no excessive reverb','no washy sound','no muddy bass','no harsh highs','no lo-fi texture','no polished pop sound'] },
  ]},
];

function esc(s) { return window.esc(s); }

// ── Body ──────────────────────────────────────────────────────
function bodySunoBuilder(idx) {
  const p = window.pipeline[idx]; if (!p.data) p.data = {};
  const d = p.data;
  if (!d.sbVals) {
    d.sbVals = {};
    SB_SECTIONS.forEach(s => { d.sbVals[s.id] = s.type === 'chips' || s.type === 'neg' ? [] : ''; });
    d.sbVals.time_sig = '';
  }
  if (!d.sbOpen) d.sbOpen = {};
  // Sync from pipelineObj meta if available and fields empty
  if (!d._synced && window.pipelineObj?.meta) {
    const meta = window.pipelineObj.meta;
    if (meta.bpm && !d.sbVals.bpm) { const bpmNum = String(meta.bpm).replace(/[^\d]/g, ''); if (bpmNum) d.sbVals.bpm = bpmNum; }
    if (meta.timeSig && !d.sbVals.time_sig) { const ts = String(meta.timeSig).match(/\d+\/\d+/); if (ts) d.sbVals.time_sig = ts[0]; }
    if (meta.key && !d.sbVals.key?.length) {
      const keyStr = String(meta.key).toLowerCase();
      const allKeys = SB_SECTIONS.find(s => s.id === 'key')?.groups.flatMap(g => g.opts) || [];
      const match = allKeys.find(k => keyStr.includes(k.toLowerCase()));
      if (match) d.sbVals.key = [match];
    }
    d._synced = true;
  }
  const V = d.sbVals;

  const order = ['genre','bpm','key','mood','vocal','inst','struct','tempo_feel','mix','energy','ref','texture','prod'];
  const lines = [];
  order.forEach(id => {
    const s = SB_SECTIONS.find(x => x.id === id);
    if (!s) return;
    let val = '';
    if (id === 'bpm') {
      const parts = [];
      if (V.bpm) parts.push(V.bpm + ' BPM');
      if (V.time_sig) parts.push(V.time_sig);
      if (!parts.length) return;
      val = parts.join(', ');
    } else {
      if (!V[id] || !V[id].length) return;
      val = V[id].join(', ');
    }
    lines.push('[' + s.lbl + ']\n' + val);
  });
  const promptText = lines.join('\n\n');
  const negText = (V.neg && V.neg.length) ? V.neg.join(', ') : '';
  const fullText = promptText + (negText ? '\n\n[NEGATIVE]\n' + negText : '');
  const charLen = fullText.length;

  const totalSecs = SB_SECTIONS.filter(s => s.id !== 'neg').length;
  const filledSecs = SB_SECTIONS.filter(s => {
    if (s.id === 'neg') return false;
    if (s.id === 'bpm') return V.bpm;
    return Array.isArray(V[s.id]) ? V[s.id].length > 0 : V[s.id];
  }).length;

  const activeTab = d.sbTab || 'builder';
  let h = `<div class="mod-tabs">`;
  h += `<button class="mod-tab${activeTab==='builder'?' active':''}" onclick="sbTab(${idx},'builder')">🎛️ Builder</button>`;
  h += `<button class="mod-tab${activeTab==='output'?' active':''}" onclick="sbTab(${idx},'output')">📋 Output <span style="font-size:9px;color:${charLen>1000?'var(--red)':'var(--muted)'}">${charLen}/1000</span></button>`;
  h += `</div>`;

  // Builder tab
  h += `<div class="mod-tab-pane${activeTab==='builder'?' active':''}">`;
  h += `<div style="padding:10px 16px;background:var(--surface2);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">`;
  h += `<span style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Sections</span>`;
  h += `<div style="flex:1;height:2px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${filledSecs/totalSecs*100}%;background:linear-gradient(90deg,var(--purple),var(--accent));transition:width .3s"></div></div>`;
  h += `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted)">${filledSecs}/${totalSecs}</span>`;
  h += `</div>`;

  // Weirdness % and Style Influence % sliders
  if (!V.weirdness) V.weirdness = 0;
  if (!V.styleInfluence) V.styleInfluence = 50;
  h += `<div style="padding:8px 16px;display:flex;gap:16px;border-bottom:1px solid var(--border);align-items:center;flex-wrap:wrap;">`;
  h += `<div style="flex:1;min-width:120px;display:flex;align-items:center;gap:6px;">`;
  h += `<span style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap">Weirdness</span>`;
  h += `<input type="range" min="0" max="100" value="${V.weirdness}" oninput="sbSlider(${idx},'weirdness',this.value)" style="flex:1;accent-color:var(--purple);">`;
  h += `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--purple);min-width:28px;text-align:right">${V.weirdness}%</span>`;
  h += `</div>`;
  h += `<div style="flex:1;min-width:120px;display:flex;align-items:center;gap:6px;">`;
  h += `<span style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap">Style</span>`;
  h += `<input type="range" min="0" max="100" value="${V.styleInfluence}" oninput="sbSlider(${idx},'styleInfluence',this.value)" style="flex:1;accent-color:var(--cyan);">`;
  h += `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--cyan);min-width:28px;text-align:right">${V.styleInfluence}%</span>`;
  h += `</div></div>`;

  h += `<div style="padding:8px 16px 16px;max-height:60vh;overflow-y:auto;">`;
  SB_SECTIONS.forEach(s => {
    const cnt = Array.isArray(V[s.id]) ? V[s.id].length : (V[s.id] ? 1 : 0);
    const isOpen = d.sbOpen[s.id] === true;
    h += `<div style="border:1px solid ${cnt>0?s.c+'44':'var(--border)'};border-radius:6px;margin-bottom:6px;overflow:hidden;">`;
    h += `<div onclick="sbTogSec(${idx},'${s.id}')" style="padding:8px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;background:var(--surface2);user-select:none;">`;
    h += `<span style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:1px 6px;border-radius:3px;border:1px solid ${s.c}44;background:${s.c}18;color:${s.c}">${s.lbl}</span>`;
    h += `<span style="font-family:'Syne',sans-serif;font-size:11px;font-weight:700;flex:1">${s.title}</span>`;
    if (cnt > 0) h += `<span style="font-family:'DM Mono',monospace;font-size:10px;color:${s.c}">${cnt} ✓</span>`;
    h += `<span style="font-size:9px;color:var(--muted);transition:transform .2s;${isOpen?'transform:rotate(180deg)':''}">▼</span>`;
    h += `</div>`;
    if (isOpen) {
      h += `<div style="padding:10px 14px;border-top:1px solid var(--border);">`;
      if (s.type === 'bpm') {
        h += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">`;
        h += `<div><label style="display:block;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">BPM</label>`;
        h += `<input type="number" min="40" max="220" placeholder="ex: 92" value="${esc(V.bpm||'')}" oninput="sbUpd(${idx},'bpm',this.value)" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:6px 10px;color:var(--text);font-family:'DM Mono',monospace;font-size:12px;outline:none;"></div>`;
        h += `<div><label style="display:block;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px">Time Signature</label>`;
        h += `<select onchange="sbUpd(${idx},'time_sig',this.value)" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:6px 10px;color:var(--text);font-family:'DM Mono',monospace;font-size:12px;outline:none;">`;
        h += `<option value="">— none —</option>`;
        ['4/4 (standard)','3/4 (waltz)','6/8 (fluid)','5/4 (irregular)','7/8 (complex)'].forEach(opt => {
          const val = opt.split(' ')[0];
          h += `<option value="${val}" ${V.time_sig===val?'selected':''}>${opt}</option>`;
        });
        h += `</select></div></div>`;
      } else {
        s.groups.forEach(g => {
          h += `<div style="margin-bottom:10px;">`;
          h += `<span style="display:block;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:5px">${esc(g.g)}</span>`;
          h += `<div style="display:flex;flex-wrap:wrap;gap:5px;">`;
          g.opts.forEach(o => {
            const sel = Array.isArray(V[s.id]) && V[s.id].includes(o);
            if (s.type === 'neg') {
              h += `<span onclick="sbChip(${idx},'${s.id}',\`${o.replace(/`/g,'\\`')}\`,true,${s.multi!==false})" style="padding:3px 9px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid ${sel?'var(--red)':'rgba(255,85,85,.2)'};background:${sel?'rgba(255,85,85,.18)':'rgba(255,85,85,.04)'};color:${sel?'var(--red)':'#ff9090'};${sel?'text-decoration:line-through;':''}user-select:none;transition:all .13s">${esc(o)}</span>`;
            } else {
              h += `<span onclick="sbChip(${idx},'${s.id}',\`${o.replace(/`/g,'\\`')}\`,false,${s.multi!==false})" style="padding:4px 10px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid ${sel?s.c:'var(--border)'};background:${sel?s.c:'var(--surface)'};color:${sel?'#0b0b0e':'var(--muted)'};${sel?'font-weight:500;':''}user-select:none;transition:all .13s">${esc(o)}</span>`;
            }
          });
          h += `</div></div>`;
        });
      }
      h += `</div>`;
    }
    h += `</div>`;
  });
  h += `</div></div>`;

  // Output tab
  h += `<div class="mod-tab-pane${activeTab==='output'?' active':''}">`;
  h += `<div style="padding:10px 16px;background:var(--surface2);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;">`;
  h += `<span style="font-family:'Syne',sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted)">Chars</span>`;
  h += `<div style="flex:1;height:2px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${Math.min(charLen/1000*100,100)}%;background:${charLen>1000?'var(--red)':'linear-gradient(90deg,var(--purple),var(--accent))'};transition:width .3s"></div></div>`;
  h += `<span style="font-family:'DM Mono',monospace;font-size:10px;color:${charLen>1000?'var(--red)':'var(--muted)'}">${charLen}/1000</span>`;
  h += `</div>`;
  if (fullText.trim()) {
    h += `<div style="padding:14px 16px;max-height:50vh;overflow-y:auto;">`;
    h += `<div style="font-family:'DM Mono',monospace;font-size:11px;line-height:1.9;white-space:pre-wrap;word-break:break-word;">`;
    fullText.split('\n\n').forEach(sec => {
      const ls = sec.split('\n');
      if (ls[0].startsWith('[')) {
        h += `<span style="color:var(--accent);font-weight:500">${esc(ls[0])}</span>\n${esc(ls.slice(1).join('\n'))}\n\n`;
      } else { h += esc(sec) + '\n\n'; }
    });
    h += `</div></div>`;
  } else {
    h += `<div style="padding:36px 16px;text-align:center;color:var(--muted);font-size:12px;font-style:italic">← Select options in the Builder tab</div>`;
  }
  h += `<div style="padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:6px;">`;
  h += `<button class="m-btn m-btn-primary" style="flex:1" onclick="sbApply(${idx})">✓ APPLY TO PIPELINE</button>`;
  h += `<button class="m-btn m-btn-ghost" style="padding:7px 12px" onclick="sbCopy(${idx})">⎘</button>`;
  h += `<button class="m-btn m-btn-danger" style="padding:7px 12px" onclick="sbCopyNeg(${idx})">⊘</button>`;
  h += `<button class="m-btn m-btn-ghost" style="padding:7px 12px" onclick="sbReset(${idx})">↺</button>`;
  h += `</div></div>`;

  return h;
}

// ── Event handlers ────────────────────────────────────────────
function sbSlider(idx, key, val) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  if (!p.data.sbVals) p.data.sbVals = {};
  p.data.sbVals[key] = parseInt(val) || 0;
  // Update display inline (no full re-render for sliders)
  const span = event?.target?.nextElementSibling;
  if (span) span.textContent = val + '%';
}

function sbTab(idx, tab) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  p.data.sbTab = tab;
  const mod = window.getEl('module-' + idx); if (!mod) return;
  const tabs = mod.querySelectorAll('.mod-tab');
  const panes = mod.querySelectorAll('.mod-tab-pane');
  const order = ['builder', 'output'];
  const ti = order.indexOf(tab);
  tabs.forEach((t, i) => t.classList.toggle('active', i === ti));
  panes.forEach((pn, i) => pn.classList.toggle('active', i === ti));
}
function sbTogSec(idx, secId) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  if (!p.data.sbOpen) p.data.sbOpen = {};
  p.data.sbOpen[secId] = !p.data.sbOpen[secId];
  window.renderModules();
}
function sbChip(idx, secId, val, isNeg, multi) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  if (!p.data.sbVals) return;
  const arr = p.data.sbVals[secId];
  if (!Array.isArray(arr)) return;
  const i = arr.indexOf(val);
  if (!multi) { p.data.sbVals[secId] = i >= 0 ? [] : [val]; }
  else { i >= 0 ? arr.splice(i, 1) : arr.push(val); }
  window.renderModules(); window.triggerAutosave('lyric');
}
function sbUpd(idx, key, val) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  if (!p.data.sbVals) return;
  p.data.sbVals[key] = val;
  window.renderModules(); window.triggerAutosave('lyric');
}
function sbCopy(idx) {
  const p = window.pipeline[idx]; if (!p?.data?.sbVals) return;
  const V = p.data.sbVals;
  const order = ['genre','bpm','key','mood','vocal','inst','struct','tempo_feel','mix','energy','ref','texture','prod'];
  const lines = [];
  order.forEach(id => {
    const s = SB_SECTIONS.find(x => x.id === id); if (!s) return;
    let val = '';
    if (id === 'bpm') { const parts = []; if (V.bpm) parts.push(V.bpm + ' BPM'); if (V.time_sig) parts.push(V.time_sig); if (!parts.length) return; val = parts.join(', '); }
    else { if (!V[id] || !V[id].length) return; val = V[id].join(', '); }
    lines.push('[' + s.lbl + ']\n' + val);
  });
  const prompt = lines.join('\n\n');
  const neg = (V.neg && V.neg.length) ? V.neg.join(', ') : '';
  const full = prompt + (neg ? '\n\n[NEGATIVE]\n' + neg : '');
  navigator.clipboard.writeText(full).then(() => window.showToast('Prompt copied! (' + full.length + ' chars)')).catch(() => window.showToast('Copy failed'));
}
function sbCopyNeg(idx) {
  const p = window.pipeline[idx]; if (!p?.data?.sbVals?.neg?.length) { window.showToast('No negatives selected'); return; }
  navigator.clipboard.writeText(p.data.sbVals.neg.join(', ')).then(() => window.showToast('Negatives copied!')).catch(() => window.showToast('Copy failed'));
}
function sbReset(idx) {
  const p = window.pipeline[idx]; if (!p) return; if (!p.data) p.data = {};
  p.data.sbVals = {};
  SB_SECTIONS.forEach(s => { p.data.sbVals[s.id] = s.type === 'chips' || s.type === 'neg' ? [] : ''; });
  p.data.sbVals.time_sig = '';
  window.renderModules(); window.triggerAutosave('lyric');
  window.showToast('Builder reset');
}

// ── Self-registration ─────────────────────────────────────────
registerModule(def, bodySunoBuilder);

// ── Apply to Pipeline ────────────────────────────────────────
async function sbApply(idx) {
  const p = window.pipeline[idx]; if (!p?.data?.sbVals) return;
  const V = p.data.sbVals;

  // Check if LI exists and is locked
  if (!window.LI) { window.showToast('Lyric Input required'); return; }
  if (!window.LI.locked) { window.showToast('Lock Lyric Input first'); return; }
  if (!window.pipelineObj) { window.showToast('Lock Lyric Input first'); return; }

  // Build chip summary
  const order = ['genre','bpm','key','mood','vocal','inst','struct','tempo_feel','mix','energy','ref','texture','prod'];
  const summary = order.map(id => {
    const s = SB_SECTIONS.find(x => x.id === id);
    if (!s) return '';
    let val = '';
    if (id === 'bpm') { const parts = []; if (V.bpm) parts.push(V.bpm + ' BPM'); if (V.time_sig) parts.push(V.time_sig); if (!parts.length) return ''; val = parts.join(', '); }
    else { if (!V[id] || !V[id].length) return ''; val = V[id].join(', '); }
    return `${s.title}: ${val}`;
  }).filter(Boolean).join('\n');

  if (!summary.trim()) { window.showToast('Select options first'); return; }

  const key = typeof window.getKey === 'function' ? window.getKey() : '';
  if (!key) { window.showToast('API key required'); return; }

  p.data.sbApplying = true;
  window.renderModules();

  try {
    const obj = window.pipelineObj;
    const fullLyrics = obj.lyrics?.sections?.map(s => s.content).join('\n\n') || '';
    const numSections = obj.lyrics?.sections?.length || 0;

    // Generate overall + sectional prompts
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: `You are a Suno AI prompt expert. Given song characteristics and lyrics, generate PERFECT Suno prompts.

RULES:
1. Generate ONE overall prompt (max 50 words) covering the entire song vibe
2. Generate ${numSections} section prompts (max 30 words each) — ONE for each section
3. Be specific, Suno-interpretable, and optimized
4. Use keywords from the provided characteristics
5. Format:
[OVERALL]
<prompt>

[SECTION 1]
<prompt>

[SECTION 2]
<prompt>
...etc`,
        messages: [{
          role: 'user',
          content: `Song characteristics:\n${summary}\n\nLyrics:\n${fullLyrics}\n\nGenerate optimized Suno prompts. Be creative and specific.`
        }]
      })
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error?.message || 'API error');
    }

    const data = await resp.json();
    const text = data.content[0]?.text || '';

    // Parse prompts
    const sections = text.split(/\[SECTION \d+\]/i);
    const overallMatch = text.match(/\[OVERALL\]([\s\S]*?)(?=\[SECTION|$)/i);
    const overall = overallMatch ? overallMatch[1].trim() : '';

    // CLEAR existing prompts
    window.LI.promptOverall = overall;
    window.LI.sectionPrompts = {};

    // Apply section prompts
    obj.lyrics?.sections?.forEach((sec, i) => {
      const secMatch = text.match(new RegExp(`\\[SECTION ${i+1}\\]([\\s\\S]*?)(?=\\[SECTION|$)`, 'i'));
      const prompt = secMatch ? secMatch[1].trim() : '';
      if (sec.name) window.LI.sectionPrompts[sec.name] = prompt;
    });

    // Update pipelineObj
    window.pipelineObj.prompt_overall = { positive: overall };
    window.pipelineObj.prompts_seccionais = {};
    Object.entries(window.LI.sectionPrompts).forEach(([name, prompt]) => {
      window.pipelineObj.prompts_seccionais[name] = { positive: prompt };
    });

    window.showToast('✓ Prompts applied');
    p.data.sbApplying = false;
    window.renderModules();
  } catch(e) {
    window.showToast('Error: ' + e.message);
    p.data.sbApplying = false;
    window.renderModules();
  }
}

// Expose to window
window.SB_SECTIONS = SB_SECTIONS;
window.sbTab = sbTab;
window.sbTogSec = sbTogSec;
window.sbChip = sbChip;
window.sbUpd = sbUpd;
window.sbSlider = sbSlider;
window.sbApply = sbApply;
window.sbCopy = sbCopy;
window.sbCopyNeg = sbCopyNeg;
window.sbReset = sbReset;
