// 소리: 효과음과 배경음을 Web Audio 로 직접 합성 (음원 파일 없음, 모두 오리지널)
// - 브라우저 정책상 첫 클릭·키 입력 뒤에 소리가 켜짐 (unlock)
// - 설정(음악·효과음 음량)은 localStorage temp-game.settings.v1
// 배경음: 오음계(궁상각치우) 현을 뜯는 소리 + 낮은 지속음 + 분위기별 북·빗소리

import { cleanSettings, cleanVolume } from '../core/settings.js';

const SETTINGS_KEY = 'temp-game.settings.v1';
let settings = cleanSettings(null);
try {
  // 깨진 값은 기본값, 범위 밖은 0~1 로 — BUG-022
  settings = cleanSettings(JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || 'null'));
} catch {
  // 저장 막힘·깨진 JSON → 기본값
}

let ctx = null;
let master = null;
let musicBus = null;
let sfxBus = null;
let noiseBuf = null;

function saveSettings() {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // 무시
  }
}

export function getVolume(kind) {
  return settings[kind];
}

export function setVolume(kind, v) {
  settings[kind] = cleanVolume(v, settings[kind]);
  saveSettings();
  if (kind === 'music' && musicBus) musicBus.gain.setTargetAtTime(settings.music * 0.55, ctx.currentTime, 0.05);
  if (kind === 'sfx' && sfxBus) sfxBus.gain.setTargetAtTime(settings.sfx, ctx.currentTime, 0.05);
}

// 모든 재료를 만든 뒤에야 ctx 를 확정 (중간에 실패해도 반쯤 켜진 상태로 남지 않게) — BUG-022
function init() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  let c = null;
  try {
    c = new AC();
    const m = c.createDynamicsCompressor();
    m.connect(c.destination);
    const mb = c.createGain();
    mb.gain.value = settings.music * 0.55;
    mb.connect(m);
    const sb = c.createGain();
    sb.gain.value = settings.sfx;
    sb.connect(m);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    ctx = c;
    master = m;
    musicBus = mb;
    sfxBus = sb;
    noiseBuf = nb;
    return true;
  } catch {
    c?.close?.();
    return false;
  }
}

// 첫 사용자 입력에서 소리 켜기
export function unlockAudio() {
  if (!init()) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (pendingMood) {
    const m = pendingMood;
    pendingMood = null;
    playMusic(m);
  }
}
['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, unlockAudio, { capture: true }));

// ── 합성 재료 ─────────────────────────
function env(gainNode, t, attack, peak, decay) {
  const g = gainNode.gain;
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(peak, t + attack);
  g.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function tone(bus, { type = 'sine', freq, to = null, t = 0, attack = 0.005, peak = 0.3, decay = 0.2, filter = null }) {
  const start = ctx.currentTime + t;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (to) o.frequency.exponentialRampToValueAtTime(to, start + attack + decay);
  const g = ctx.createGain();
  env(g, start, attack, peak, decay);
  let node = o;
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = filter.type ?? 'lowpass';
    f.frequency.value = filter.freq;
    f.Q.value = filter.q ?? 0.7;
    o.connect(f);
    node = f;
  }
  node.connect(g);
  g.connect(bus);
  o.start(start);
  o.stop(start + attack + decay + 0.05);
}

function noise(bus, { t = 0, attack = 0.003, peak = 0.3, decay = 0.15, type = 'bandpass', freq = 1500, to = null, q = 1 }) {
  const start = ctx.currentTime + t;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, start);
  if (to) f.frequency.exponentialRampToValueAtTime(to, start + attack + decay);
  f.Q.value = q;
  const g = ctx.createGain();
  env(g, start, attack, peak, decay);
  src.connect(f);
  f.connect(g);
  g.connect(bus);
  src.start(start, Math.random() * 0.5);
  src.stop(start + attack + decay + 0.05);
}

// 현을 뜯는 소리 (고쟁·비파 느낌): 톱니파 + 빠르게 닫히는 저역 필터
function pluck(bus, freq, t, vol = 0.18, length = 1.4) {
  const start = ctx.currentTime + t;
  const o = ctx.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = freq;
  const o2 = ctx.createOscillator();
  o2.type = 'triangle';
  o2.frequency.value = freq * 2.003;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = 2;
  f.frequency.setValueAtTime(freq * 9, start);
  f.frequency.exponentialRampToValueAtTime(freq * 1.2, start + 0.35);
  const g = ctx.createGain();
  env(g, start, 0.004, vol, length);
  const g2 = ctx.createGain();
  g2.gain.value = 0.25;
  o.connect(f);
  o2.connect(g2);
  g2.connect(f);
  f.connect(g);
  g.connect(bus);
  o.start(start);
  o2.start(start);
  o.stop(start + length + 0.1);
  o2.stop(start + length + 0.1);
}

// ── 효과음 ─────────────────────────
const SFX = {
  slash() { // 검: 바람 가르는 소리 + 쇳소리
    noise(sfxBus, { type: 'bandpass', freq: 5000, to: 900, q: 1.2, peak: 0.45, decay: 0.16 });
    tone(sfxBus, { type: 'triangle', freq: 2400, to: 1800, peak: 0.06, decay: 0.12 });
  },
  impact() { // 권: 묵직한 타격
    tone(sfxBus, { type: 'sine', freq: 140, to: 50, peak: 0.6, decay: 0.18 });
    noise(sfxBus, { type: 'lowpass', freq: 900, peak: 0.35, decay: 0.08 });
  },
  stab() { // 살수: 짧고 날카로운
    noise(sfxBus, { type: 'highpass', freq: 3500, peak: 0.3, decay: 0.07 });
    tone(sfxBus, { type: 'square', freq: 1600, to: 900, peak: 0.04, decay: 0.06 });
  },
  hit() {
    noise(sfxBus, { type: 'lowpass', freq: 1400, peak: 0.35, decay: 0.1 });
    tone(sfxBus, { type: 'sine', freq: 200, to: 90, peak: 0.35, decay: 0.12 });
  },
  crit() {
    SFX.hit();
    tone(sfxBus, { type: 'triangle', freq: 1760, peak: 0.12, decay: 0.5 });
    tone(sfxBus, { type: 'triangle', freq: 2637, peak: 0.07, decay: 0.45, t: 0.01 });
    tone(sfxBus, { type: 'sine', freq: 90, to: 40, peak: 0.6, decay: 0.3 });
  },
  miss() { // 허공을 가르는 바람
    noise(sfxBus, { type: 'bandpass', freq: 600, to: 2600, q: 0.8, peak: 0.18, attack: 0.04, decay: 0.2 });
  },
  card() { // 카드를 내는 종이 소리
    noise(sfxBus, { type: 'highpass', freq: 2500, peak: 0.08, decay: 0.05 });
  },
  click() {
    tone(sfxBus, { type: 'sine', freq: 900, peak: 0.05, decay: 0.04 });
  },
  buff() { // 기를 끌어올림: 오음계 상승
    [392, 440, 523, 659].forEach((f, i) => tone(sfxBus, { type: 'triangle', freq: f, t: i * 0.05, peak: 0.07, decay: 0.25 }));
  },
  debuff() {
    tone(sfxBus, { type: 'triangle', freq: 330, to: 196, peak: 0.08, decay: 0.3 });
  },
  poison() {
    for (let i = 0; i < 3; i++) tone(sfxBus, { type: 'sine', freq: 220 + i * 40, to: 120, t: i * 0.06, peak: 0.08, decay: 0.1 });
  },
  heal() {
    [659, 784, 988].forEach((f, i) => tone(sfxBus, { type: 'sine', freq: f, t: i * 0.06, peak: 0.06, decay: 0.4 }));
  },
  point() { // 점혈: 침 놓는 소리
    tone(sfxBus, { type: 'sine', freq: 2200, peak: 0.07, decay: 0.08 });
  },
  stun() { // 굳음: 맑은 종
    tone(sfxBus, { type: 'sine', freq: 880, peak: 0.15, decay: 0.9 });
    tone(sfxBus, { type: 'sine', freq: 1320, peak: 0.08, decay: 0.7 });
    tone(sfxBus, { type: 'sine', freq: 2217, peak: 0.04, decay: 0.5 });
  },
  gong() { // 파기·두목 변신: 징
    [110, 165.5, 227, 298].forEach((f, i) => tone(sfxBus, { type: 'sine', freq: f, peak: 0.25 / (i + 1), attack: 0.01, decay: 2.2 - i * 0.3 }));
    noise(sfxBus, { type: 'lowpass', freq: 400, peak: 0.3, decay: 0.3 });
  },
  item() {
    tone(sfxBus, { type: 'sine', freq: 520, to: 780, peak: 0.1, decay: 0.12 });
  },
  coin() {
    tone(sfxBus, { type: 'square', freq: 1318, peak: 0.04, decay: 0.08, filter: { freq: 3000 } });
    tone(sfxBus, { type: 'square', freq: 1760, peak: 0.04, decay: 0.15, t: 0.07, filter: { freq: 3000 } });
  },
  turn() {
    tone(sfxBus, { type: 'sine', freq: 330, peak: 0.05, decay: 0.15 });
  },
  victory() {
    [392, 440, 523, 587, 784].forEach((f, i) => pluck(sfxBus, f, i * 0.12, 0.2, 1.2));
  },
  defeat() {
    [330, 294, 247, 196].forEach((f, i) => pluck(sfxBus, f, i * 0.28, 0.18, 1.6));
    tone(sfxBus, { type: 'sine', freq: 65, peak: 0.2, attack: 0.3, decay: 2.5 });
  },
  regress() { // 회귀: 거꾸로 부풀어 오르는 소리
    noise(sfxBus, { type: 'bandpass', freq: 300, to: 6000, q: 0.6, peak: 0.25, attack: 1.2, decay: 0.6 });
    tone(sfxBus, { type: 'sine', freq: 220, to: 880, peak: 0.12, attack: 1.2, decay: 0.8 });
  },
  door() { // 문이 부서짐
    tone(sfxBus, { type: 'sine', freq: 90, to: 35, peak: 0.7, decay: 0.4 });
    noise(sfxBus, { type: 'lowpass', freq: 1800, to: 300, peak: 0.5, decay: 0.5 });
  },
};

export function sfx(name) {
  if (!ctx || ctx.state !== 'running' || settings.sfx <= 0) return;
  SFX[name]?.();
}

// ── 배경음 ─────────────────────────
// 분위기: 음높이 목록(오음계), 빠르기, 지속음, 북, 빗소리
const D = 146.83; // 레
const MOODS = {
  title: { scale: [D, 164.81, 196, 220, 246.94, 293.66, 329.63], beat: 0.75, density: 0.35, drone: [73.42, 110], drum: false },
  inn: { scale: [D, 164.81, 196, 220, 246.94, 293.66], beat: 0.9, density: 0.28, drone: [73.42], drum: false, rain: true },
  arena: { scale: [196, 220, 246.94, 293.66, 329.63, 392, 440], beat: 0.5, density: 0.45, drone: [98, 146.83], drum: 'light' },
  forest: { scale: [164.81, 185, 220, 246.94, 277.18, 329.63, 370], beat: 0.6, density: 0.32, drone: [82.41, 123.47], drum: false, crickets: true },
  gate: { scale: [174.61, 207.65, 233.08, 261.63, 311.13, 349.23], beat: 0.42, density: 0.5, drone: [87.31, 130.81], drum: 'war' },
  alley: { scale: [146.83, 164.81, 196, 220, 246.94, 293.66], beat: 0.55, density: 0.38, drone: [73.42, 110], drum: 'light' },
  hall: { scale: [196, 220, 261.63, 293.66, 329.63, 392], beat: 0.45, density: 0.48, drone: [98, 146.83], drum: 'war' },
  boss: { scale: [146.83, 174.61, 196, 220, 261.63, 293.66], beat: 0.36, density: 0.6, drone: [73.42, 110, 155.56], drum: 'war' },
};

let current = null; // { name, timer, nodes, step }
let pendingMood = null;

function startDrone(freqs) {
  return freqs.map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 0 ? 'sine' : 'triangle';
    o.frequency.value = f;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07 + i * 0.03;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 0.015;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(i === 0 ? 0.05 : 0.02, ctx.currentTime + 3);
    lfo.connect(lfoG);
    lfoG.connect(g.gain);
    o.connect(g);
    g.connect(musicBus);
    o.start();
    lfo.start();
    return { stop: (t) => { g.gain.setTargetAtTime(0.0001, t, 0.6); o.stop(t + 3); lfo.stop(t + 3); } };
  });
}

function startRain() {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 2500;
  f.Q.value = 0.4;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 2);
  src.connect(f);
  f.connect(g);
  g.connect(musicBus);
  src.start();
  return { stop: (t) => { g.gain.setTargetAtTime(0.0001, t, 0.6); src.stop(t + 3); } };
}

export function playMusic(name) {
  if (!ctx || ctx.state !== 'running') {
    pendingMood = name;
    return;
  }
  if (current?.name === name) return;
  stopMusic();
  const mood = MOODS[name];
  if (!mood) return;
  const nodes = startDrone(mood.drone);
  if (mood.rain) nodes.push(startRain());
  const state = { name, nodes, step: 0, last: 2 };
  // 한 박자마다: 확률로 현 뜯기 (가까운 음으로 이어지게), 북
  state.timer = setInterval(() => {
    if (ctx.state !== 'running') return;
    const s = state.step++;
    const sc = mood.scale;
    if (Math.random() < mood.density || s % 8 === 0) {
      state.last = Math.max(0, Math.min(sc.length - 1, state.last + Math.round((Math.random() - 0.5) * 3)));
      pluck(musicBus, sc[state.last], 0.02, 0.09 + Math.random() * 0.04, mood.beat * 3);
      if (Math.random() < 0.18) pluck(musicBus, sc[state.last] * 2, 0.02 + mood.beat / 2, 0.04, mood.beat * 2);
    }
    if (mood.drum === 'war' && (s % 4 === 0 || (s % 8 === 6))) {
      tone(musicBus, { type: 'sine', freq: 70, to: 40, peak: s % 8 === 0 ? 0.3 : 0.18, decay: 0.35 });
    } else if (mood.drum === 'light' && s % 8 === 0) {
      tone(musicBus, { type: 'sine', freq: 110, to: 60, peak: 0.12, decay: 0.25 });
    }
    if (mood.crickets && Math.random() < 0.15) {
      for (let i = 0; i < 3; i++) tone(musicBus, { type: 'sine', freq: 4200, t: i * 0.05, peak: 0.012, decay: 0.03 });
    }
  }, mood.beat * 1000);
  current = state;
}

export function stopMusic() {
  pendingMood = null;
  if (!current) return;
  clearInterval(current.timer);
  const t = ctx.currentTime;
  current.nodes.forEach((n) => n.stop(t));
  current = null;
}
