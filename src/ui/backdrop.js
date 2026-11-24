// 전투 배경: 어두운 하늘 + 흐르는 연기 + 떠오르는 불티 (샘플 일러스트 분위기에 맞춤)
export function createBackdrop(canvas) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // 연기 덩어리 (천천히 좌우로 흐름)
  const fog = Array.from({ length: 10 }, (_, i) => ({
    x: Math.random() * W,
    y: H * 0.35 + Math.random() * H * 0.6,
    r: 140 + Math.random() * 180,
    speed: (Math.random() * 0.5 + 0.2) * (i % 2 ? 1 : -1),
    alpha: 0.05 + Math.random() * 0.08,
  }));

  // 불티
  const embers = Array.from({ length: 70 }, () => spawnEmber(true));
  function spawnEmber(anywhere = false) {
    return {
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : H + 10,
      vy: 0.25 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.3,
      size: 0.8 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
    };
  }

  let last = performance.now();
  function draw(now) {
    const dt = Math.min(50, now - last) / 16.7;
    last = now;

    // 하늘
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#141a22');
    sky.addColorStop(0.55, '#232c37');
    sky.addColorStop(1, '#2a2226');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // 아래쪽 붉은 기운
    const glow = g.createRadialGradient(W / 2, H * 1.05, 40, W / 2, H * 1.05, W * 0.7);
    glow.addColorStop(0, 'rgba(150, 48, 32, 0.45)');
    glow.addColorStop(1, 'rgba(150, 48, 32, 0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);

    // 연기
    for (const f of fog) {
      f.x += f.speed * dt;
      if (f.x - f.r > W) f.x = -f.r;
      if (f.x + f.r < 0) f.x = W + f.r;
      const grad = g.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      grad.addColorStop(0, `rgba(170, 180, 195, ${f.alpha})`);
      grad.addColorStop(1, 'rgba(170, 180, 195, 0)');
      g.fillStyle = grad;
      g.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }

    // 불티
    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];
      e.y -= e.vy * dt;
      e.x += (e.vx + Math.sin(now / 900 + e.phase) * 0.25) * dt;
      if (e.y < -10) embers[i] = spawnEmber();
      const flicker = 0.55 + Math.sin(now / 160 + e.phase) * 0.35;
      g.fillStyle = `rgba(255, 120, 40, ${0.18 * flicker})`;
      g.beginPath();
      g.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = `rgba(255, 190, 110, ${flicker})`;
      g.beginPath();
      g.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      g.fill();
    }

    // 가장자리 어둡게 (비네트)
    const vig = g.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.65);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = vig;
    g.fillRect(0, 0, W, H);
  }

  return { draw };
}
