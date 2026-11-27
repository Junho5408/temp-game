// 소리 설정 정리 (화면 쪽 audio.js 가 불러올 때 씀) — BUG-022
// 숫자가 아니면 기본값, 숫자면 0~1 로 자름
export const DEFAULT_SETTINGS = { music: 0.5, sfx: 0.7 };

export function cleanVolume(v, fallback) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(1, v));
}

export function cleanSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    music: cleanVolume(src.music, DEFAULT_SETTINGS.music),
    sfx: cleanVolume(src.sfx, DEFAULT_SETTINGS.sfx),
  };
}
