import * as THREE from 'three';

let cachedDalmatian: THREE.CanvasTexture | null = null;
let cachedPolka: THREE.CanvasTexture | null = null;
let cachedWood: { map: THREE.CanvasTexture; roughness: THREE.CanvasTexture } | null = null;

// Procedural Dalmatian spot canvas texture (Cached & Optimized)
export function createDalmatianTexture(): THREE.CanvasTexture {
  if (cachedDalmatian) return cachedDalmatian;
  if (typeof document === 'undefined') return new THREE.CanvasTexture(new OffscreenCanvas(256, 256) as unknown as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#1A1A1A';
    const spots = [
      { x: 50, y: 40, rx: 14, ry: 10, rot: 0.3 },
      { x: 140, y: 60, rx: 16, ry: 12, rot: -0.5 },
      { x: 210, y: 35, rx: 11, ry: 15, rot: 0.2 },
      { x: 40, y: 125, rx: 15, ry: 18, rot: 0.8 },
      { x: 110, y: 140, rx: 18, ry: 13, rot: -0.2 },
      { x: 190, y: 120, rx: 12, ry: 16, rot: 0.4 },
      { x: 240, y: 175, rx: 16, ry: 11, rot: -0.3 },
      { x: 75, y: 210, rx: 15, ry: 12, rot: 0.6 },
      { x: 160, y: 220, rx: 18, ry: 14, rot: -0.7 },
      { x: 225, y: 230, rx: 10, ry: 13, rot: 0.1 },
    ];

    spots.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  cachedDalmatian = texture;
  return texture;
}

// Procedural Polka dot texture (Cached & Optimized)
export function createPolkaTexture(color = '#F472B6'): THREE.CanvasTexture {
  if (cachedPolka) return cachedPolka;
  if (typeof document === 'undefined') return new THREE.CanvasTexture(new OffscreenCanvas(256, 256) as unknown as HTMLCanvasElement);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = color;
    const dots = [
      [64, 64], [192, 64],
      [128, 128],
      [64, 192], [192, 192]
    ];
    dots.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  cachedPolka = texture;
  return texture;
}

// Procedural Realistic Wood Floor Texture (Cached & 512x512 Optimized)
export function createWoodFloorTexture(): { map: THREE.CanvasTexture; roughness: THREE.CanvasTexture } {
  if (cachedWood) return cachedWood;

  if (typeof document === 'undefined') {
    const dummy = new THREE.CanvasTexture(new OffscreenCanvas(256, 256) as unknown as HTMLCanvasElement);
    return { map: dummy, roughness: dummy };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const roughCtx = roughCanvas.getContext('2d')!;

  const plankHeight = 42;
  const numPlanks = Math.ceil(512 / plankHeight);

  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    const baseLightness = 36 + (i % 4) * 2;
    ctx.fillStyle = `hsl(28, 22%, ${baseLightness}%)`;
    ctx.fillRect(0, y, 512, plankHeight);

    ctx.fillStyle = '#4b3829';
    ctx.fillRect(0, y, 512, 0.7);

    const shift = (i % 3) * 170;
    for (let x = shift; x < 512; x += 170) {
      ctx.fillRect(x, y, 0.7, plankHeight);
    }

    roughCtx.fillStyle = `rgb(${190 + (i % 3) * 15}, ${190 + (i % 3) * 15}, ${190 + (i % 3) * 15})`;
    roughCtx.fillRect(0, y, 512, plankHeight);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(4, 4);

  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.wrapS = THREE.RepeatWrapping;
  roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(4, 4);

  cachedWood = { map, roughness };
  return cachedWood;
}
