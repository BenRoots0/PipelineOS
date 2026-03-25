// ═══════════════════════════════════════════════════════════════
// UTILS: Audio  |  audio.js
// Pipeline OS · v4.1 · src/utils/audio.js
// ═══════════════════════════════════════════════════════════════

export function playStartupJingle() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    // Beep 1: C4 (261.63 Hz)
    const osc1 = ctx.createOscillator(); const g1 = ctx.createGain();
    osc1.connect(g1); g1.connect(ctx.destination);
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(261.63, t);
    g1.gain.setValueAtTime(0, t); g1.gain.linearRampToValueAtTime(0.12, t + 0.015);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc1.start(t); osc1.stop(t + 0.12);
    // Beep 2: G4 (392 Hz) — perfect fifth, 7 semitones up
    const osc2 = ctx.createOscillator(); const g2 = ctx.createGain();
    osc2.connect(g2); g2.connect(ctx.destination);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(392, t + 0.1);
    g2.gain.setValueAtTime(0, t + 0.1); g2.gain.linearRampToValueAtTime(0.12, t + 0.115);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc2.start(t + 0.1); osc2.stop(t + 0.24);
  } catch (e) {}
}

export function playUnlockJingle() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    const t = ctx.currentTime;
    // Glissando from C4 (~261Hz) up to C5 (~523Hz)
    osc.frequency.setValueAtTime(261.63, t);
    osc.frequency.exponentialRampToValueAtTime(523.25, t + 0.45);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.11, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.50);
    osc.start(t); osc.stop(t + 0.55);
  } catch (e) {}
}

// Expose to window
window.playStartupJingle = playStartupJingle;
window.playUnlockJingle = playUnlockJingle;
