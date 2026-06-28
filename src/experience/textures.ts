import * as THREE from 'three';

/** Warm walnut wood grain — used on the island and open shelving. */
export function makeWoodTexture(): THREE.Texture {
  const w = 512;
  const h = 512;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5b4631';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 170; i++) {
    const x = Math.random() * w;
    const base = 48 + Math.random() * 58;
    ctx.strokeStyle = `rgba(${base + 28},${base},${base - 22},0.16)`;
    ctx.lineWidth = 1 + Math.random() * 2.4;
    const amp = 6 + Math.random() * 24;
    const ph = Math.random() * 6.283;
    const freq = 0.5 + Math.random() * 1.3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y <= h; y += 6) ctx.lineTo(x + Math.sin(y * 0.011 * freq + ph) * amp, y);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Soft Carrara-style marble — used on the counters and island top. */
export function makeMarbleTexture(): THREE.Texture {
  const w = 512;
  const h = 512;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ece7db';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 40 + Math.random() * 130;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(208,203,193,0.18)');
    g.addColorStop(1, 'rgba(208,203,193,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.283);
    ctx.fill();
  }
  for (let i = 0; i < 20; i++) {
    ctx.strokeStyle = `rgba(120,118,112,${0.05 + Math.random() * 0.1})`;
    ctx.lineWidth = 0.6 + Math.random() * 1.8;
    let x = Math.random() * w;
    let y = 0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    while (y < h) {
      x += (Math.random() - 0.5) * 42;
      y += 12 + Math.random() * 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Grayscale micro-noise for a non-uniform matte roughness (lacquer/wood). */
export function makeRoughnessNoise(): THREE.Texture {
  const s = 256;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < s * s; i++) {
    const v = 150 + Math.floor(Math.random() * 55);
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3);
  return t;
}
