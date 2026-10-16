import * as THREE from 'three';

// SVGs designed with warm watercolors / children storybook illustration style
const CHARACTER_SVGS: Record<string, string> = {
  giraffe: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 700" width="400" height="700">
      <defs>
        <radialGradient id="gbody" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FFE8B2"/>
          <stop offset="80%" stop-color="#FCD37B"/>
          <stop offset="100%" stop-color="#EBB353"/>
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15"/>
        </filter>
      </defs>
      <!-- Ears -->
      <ellipse cx="140" cy="180" rx="35" ry="18" fill="#FCD37B" transform="rotate(-30 140 180)"/>
      <ellipse cx="140" cy="180" rx="22" ry="10" fill="#FFB7B2" transform="rotate(-30 140 180)"/>
      <ellipse cx="260" cy="180" rx="35" ry="18" fill="#FCD37B" transform="rotate(30 260 180)"/>
      <ellipse cx="260" cy="180" rx="22" ry="10" fill="#FFB7B2" transform="rotate(30 260 180)"/>
      <!-- Horns / Ossicones -->
      <rect x="172" y="110" width="12" height="45" rx="6" fill="#DDA15E"/>
      <circle cx="178" cy="110" r="14" fill="#8B4513"/>
      <rect x="216" y="110" width="12" height="45" rx="6" fill="#DDA15E"/>
      <circle cx="222" cy="110" r="14" fill="#8B4513"/>
      <!-- Head -->
      <path d="M150 170 C130 200 130 250 160 270 C170 310 230 310 240 270 C270 250 270 200 250 170 C230 140 170 140 150 170 Z" fill="url(#gbody)" filter="url(#shadow)"/>
      <!-- Snout -->
      <ellipse cx="200" cy="275" rx="42" ry="30" fill="#FFF3D6"/>
      <!-- Nostrils -->
      <ellipse cx="188" cy="268" rx="4" ry="7" fill="#8B4513"/>
      <ellipse cx="212" cy="268" rx="4" ry="7" fill="#8B4513"/>
      <!-- Smile -->
      <path d="M188 285 Q200 295 212 285" stroke="#8B4513" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Eyes & Cheeks -->
      <circle cx="168" cy="225" r="9" fill="#2B1E16"/>
      <circle cx="166" cy="222" r="3" fill="#FFFFFF"/>
      <circle cx="232" cy="225" r="9" fill="#2B1E16"/>
      <circle cx="230" cy="222" r="3" fill="#FFFFFF"/>
      <ellipse cx="155" cy="242" rx="10" ry="6" fill="#FFB7B2" opacity="0.6"/>
      <ellipse cx="245" cy="242" rx="10" ry="6" fill="#FFB7B2" opacity="0.6"/>
      <!-- Long Neck -->
      <path d="M175 300 C165 370 155 450 145 530 L255 530 C245 450 235 370 225 300 Z" fill="url(#gbody)"/>
      <!-- Neck Mane -->
      <path d="M225 320 Q240 330 227 340 Q240 350 228 360 Q242 370 230 380 Q243 390 232 400 Q244 410 234 420 Q245 430 236 440" stroke="#8B4513" stroke-width="8" stroke-linecap="round" fill="none"/>
      <!-- Spots on Neck -->
      <path d="M180 340 Q200 330 205 355 Q195 370 178 365 Z" fill="#9C5B28"/>
      <path d="M165 400 Q185 390 190 415 Q175 430 160 420 Z" fill="#9C5B28"/>
      <path d="M210 430 Q230 420 235 445 Q220 460 205 450 Z" fill="#9C5B28"/>
      <path d="M170 475 Q195 465 200 495 Q180 510 165 495 Z" fill="#9C5B28"/>
      <!-- Body & Legs -->
      <ellipse cx="200" cy="560" rx="90" ry="70" fill="url(#gbody)"/>
      <path d="M140 590 L135 680 L160 680 L165 590 Z" fill="url(#gbody)"/>
      <path d="M240 590 L235 680 L260 680 L265 590 Z" fill="url(#gbody)"/>
      <rect x="135" y="670" width="25" height="15" rx="4" fill="#663A1E"/>
      <rect x="235" y="670" width="25" height="15" rx="4" fill="#663A1E"/>
      <!-- Body spots -->
      <ellipse cx="160" cy="550" rx="16" ry="12" fill="#9C5B28"/>
      <ellipse cx="230" cy="560" rx="20" ry="15" fill="#9C5B28"/>
      <ellipse cx="195" cy="580" rx="14" ry="10" fill="#9C5B28"/>
    </svg>
  `,
  lion: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="lmane" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="#C27D38"/>
          <stop offset="100%" stop-color="#8F4F19"/>
        </radialGradient>
        <radialGradient id="lface" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#FFE6A7"/>
          <stop offset="100%" stop-color="#F6BD60"/>
        </radialGradient>
      </defs>
      <!-- Mane Fluff -->
      <g fill="url(#lmane)">
        <circle cx="250" cy="200" r="130"/>
        <circle cx="150" cy="140" r="50"/>
        <circle cx="350" cy="140" r="50"/>
        <circle cx="120" cy="220" r="45"/>
        <circle cx="380" cy="220" r="45"/>
        <circle cx="150" cy="290" r="48"/>
        <circle cx="350" cy="290" r="48"/>
        <circle cx="250" cy="90" r="45"/>
        <circle cx="190" cy="110" r="48"/>
        <circle cx="310" cy="110" r="48"/>
      </g>
      <!-- Ears -->
      <circle cx="170" cy="130" r="28" fill="#F6BD60"/>
      <circle cx="170" cy="130" r="16" fill="#F28482"/>
      <circle cx="330" cy="130" r="28" fill="#F6BD60"/>
      <circle cx="330" cy="130" r="16" fill="#F28482"/>
      <!-- Face -->
      <circle cx="250" cy="210" r="85" fill="url(#lface)"/>
      <!-- Cheeks -->
      <ellipse cx="205" cy="225" rx="14" ry="8" fill="#F28482" opacity="0.6"/>
      <ellipse cx="295" cy="225" rx="14" ry="8" fill="#F28482" opacity="0.6"/>
      <!-- Eyes -->
      <ellipse cx="215" cy="195" rx="10" ry="12" fill="#2D2013"/>
      <circle cx="213" cy="192" r="3.5" fill="#FFFFFF"/>
      <ellipse cx="285" cy="195" rx="10" ry="12" fill="#2D2013"/>
      <circle cx="283" cy="192" r="3.5" fill="#FFFFFF"/>
      <!-- Muzzle -->
      <ellipse cx="238" cy="235" rx="16" ry="13" fill="#FFF2DC"/>
      <ellipse cx="262" cy="235" rx="16" ry="13" fill="#FFF2DC"/>
      <polygon points="250,218 240,227 260,227" fill="#8F4F19"/>
      <path d="M238 238 Q250 248 262 238" stroke="#8F4F19" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Body & Paws -->
      <ellipse cx="250" cy="370" rx="70" ry="80" fill="url(#lface)"/>
      <ellipse cx="250" cy="370" rx="42" ry="55" fill="#FFF2DC"/>
      <!-- Front Paws -->
      <ellipse cx="215" cy="440" rx="26" ry="20" fill="url(#lface)"/>
      <circle cx="205" cy="442" r="4" fill="#C27D38"/>
      <circle cx="215" cy="445" r="4" fill="#C27D38"/>
      <circle cx="225" cy="442" r="4" fill="#C27D38"/>
      <ellipse cx="285" cy="440" rx="26" ry="20" fill="url(#lface)"/>
      <circle cx="275" cy="442" r="4" fill="#C27D38"/>
      <circle cx="285" cy="445" r="4" fill="#C27D38"/>
      <circle cx="295" cy="442" r="4" fill="#C27D38"/>
    </svg>
  `,
  elephant: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="egray" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="80%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </radialGradient>
      </defs>
      <!-- Big Ears -->
      <ellipse cx="140" cy="210" rx="70" ry="90" fill="url(#egray)" transform="rotate(-15 140 210)"/>
      <ellipse cx="145" cy="215" rx="45" ry="65" fill="#FBCFE8" opacity="0.8" transform="rotate(-15 145 215)"/>
      <ellipse cx="360" cy="210" rx="70" ry="90" fill="url(#egray)" transform="rotate(15 360 210)"/>
      <ellipse cx="355" cy="215" rx="45" ry="65" fill="#FBCFE8" opacity="0.8" transform="rotate(15 355 215)"/>
      <!-- Head -->
      <ellipse cx="250" cy="220" rx="85" ry="80" fill="url(#egray)"/>
      <!-- Cheeks -->
      <ellipse cx="195" cy="240" rx="14" ry="9" fill="#F472B6" opacity="0.5"/>
      <ellipse cx="305" cy="240" rx="14" ry="9" fill="#F472B6" opacity="0.5"/>
      <!-- Eyes with cute eyelashes -->
      <ellipse cx="205" cy="205" rx="9" ry="11" fill="#1E293B"/>
      <circle cx="202" cy="202" r="3.5" fill="#FFFFFF"/>
      <path d="M198 194 L192 188" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="295" cy="205" rx="9" ry="11" fill="#1E293B"/>
      <circle cx="292" cy="202" r="3.5" fill="#FFFFFF"/>
      <path d="M302 194 L308 188" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Trunk curving up -->
      <path d="M240 230 C235 290 220 330 250 340 C270 345 275 325 260 310 C252 300 252 270 260 230 Z" fill="url(#egray)"/>
      <path d="M238 270 Q250 274 256 270" stroke="#94A3B8" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M237 285 Q248 289 254 285" stroke="#94A3B8" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Body & Sitting Feet -->
      <ellipse cx="250" cy="380" rx="80" ry="75" fill="url(#egray)"/>
      <!-- Baby sitting paws -->
      <ellipse cx="180" cy="425" rx="35" ry="25" fill="url(#egray)" transform="rotate(-10 180 425)"/>
      <circle cx="165" cy="430" r="5" fill="#F1F5F9"/>
      <circle cx="178" cy="434" r="5" fill="#F1F5F9"/>
      <circle cx="192" cy="430" r="5" fill="#F1F5F9"/>
      <ellipse cx="320" cy="425" rx="35" ry="25" fill="url(#egray)" transform="rotate(10 320 425)"/>
      <circle cx="308" cy="430" r="5" fill="#F1F5F9"/>
      <circle cx="322" cy="434" r="5" fill="#F1F5F9"/>
      <circle cx="335" cy="430" r="5" fill="#F1F5F9"/>
    </svg>
  `,
  dino: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="dgreen" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#86EFAC"/>
          <stop offset="70%" stop-color="#4ADE80"/>
          <stop offset="100%" stop-color="#22C55E"/>
        </radialGradient>
      </defs>
      <!-- Back spikes -->
      <polygon points="170,160 140,140 180,130" fill="#FACC15"/>
      <polygon points="150,210 120,200 160,180" fill="#FACC15"/>
      <polygon points="140,270 100,265 145,240" fill="#FACC15"/>
      <polygon points="135,340 90,340 135,310" fill="#FACC15"/>
      <!-- Head & Body -->
      <path d="M190 140 C280 120 330 170 320 220 C310 250 260 260 250 270 C280 300 310 370 290 420 C270 460 210 460 180 430 C120 440 90 380 140 330 C150 270 140 210 190 140 Z" fill="url(#dgreen)"/>
      <!-- Belly -->
      <path d="M220 280 C260 280 280 340 260 410 C230 420 200 390 200 340 Z" fill="#FEF08A"/>
      <!-- Eye -->
      <circle cx="260" cy="180" r="16" fill="#FFFFFF"/>
      <circle cx="265" cy="180" r="9" fill="#15803D"/>
      <circle cx="267" cy="177" r="3" fill="#FFFFFF"/>
      <!-- Cheek -->
      <circle cx="280" cy="210" r="10" fill="#F472B6" opacity="0.6"/>
      <!-- Smile -->
      <path d="M260 225 Q280 235 295 220" stroke="#166534" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Tiny arms -->
      <ellipse cx="270" cy="300" rx="18" ry="10" fill="#4ADE80" transform="rotate(20 270 300)"/>
      <!-- Legs -->
      <ellipse cx="200" cy="440" rx="25" ry="18" fill="#22C55E"/>
      <ellipse cx="260" cy="435" rx="25" ry="18" fill="#22C55E"/>
    </svg>
  `,
  bear: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="bbrown" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#E9D8A6"/>
          <stop offset="80%" stop-color="#DDA15E"/>
          <stop offset="100%" stop-color="#BC6C25"/>
        </radialGradient>
      </defs>
      <!-- Ears -->
      <circle cx="160" cy="150" r="42" fill="url(#bbrown)"/>
      <circle cx="160" cy="150" r="24" fill="#FFE8D6"/>
      <circle cx="340" cy="150" r="42" fill="url(#bbrown)"/>
      <circle cx="340" cy="150" r="24" fill="#FFE8D6"/>
      <!-- Head -->
      <circle cx="250" cy="220" r="95" fill="url(#bbrown)"/>
      <!-- Muzzle -->
      <ellipse cx="250" cy="245" rx="38" ry="30" fill="#FFE8D6"/>
      <ellipse cx="250" cy="232" rx="14" ry="10" fill="#4A2810"/>
      <path d="M250 242 L250 255 M240 255 Q250 263 260 255" stroke="#4A2810" stroke-width="3" fill="none" stroke-linecap="round"/>
      <!-- Eyes & Cheeks -->
      <circle cx="205" cy="205" r="9" fill="#281507"/>
      <circle cx="203" cy="202" r="3" fill="#FFFFFF"/>
      <circle cx="295" cy="205" r="9" fill="#281507"/>
      <circle cx="293" cy="202" r="3" fill="#FFFFFF"/>
      <ellipse cx="190" cy="235" rx="12" ry="7" fill="#F28482" opacity="0.6"/>
      <ellipse cx="310" cy="235" rx="12" ry="7" fill="#F28482" opacity="0.6"/>
      <!-- Body -->
      <ellipse cx="250" cy="370" rx="80" ry="85" fill="url(#bbrown)"/>
      <ellipse cx="250" cy="370" rx="45" ry="55" fill="#FFE8D6"/>
      <!-- Cute Bowtie -->
      <polygon points="220,305 250,315 220,325" fill="#E63946"/>
      <polygon points="280,305 250,315 280,325" fill="#E63946"/>
      <circle cx="250" cy="315" r="7" fill="#C1121F"/>
      <!-- Paws -->
      <circle cx="170" cy="430" r="30" fill="url(#bbrown)"/>
      <circle cx="170" cy="430" r="16" fill="#FFE8D6"/>
      <circle cx="330" cy="430" r="30" fill="url(#bbrown)"/>
      <circle cx="330" cy="430" r="16" fill="#FFE8D6"/>
    </svg>
  `,
  astronaut: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <defs>
        <radialGradient id="helmet" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="70%" stop-color="#E2E8F0"/>
          <stop offset="100%" stop-color="#94A3B8"/>
        </radialGradient>
        <linearGradient id="visor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCD34D"/>
          <stop offset="40%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#B45309"/>
        </linearGradient>
      </defs>
      <!-- Helmet -->
      <circle cx="250" cy="200" r="105" fill="url(#helmet)"/>
      <!-- Visor -->
      <ellipse cx="250" cy="200" rx="75" ry="60" fill="url(#visor)"/>
      <!-- Visor Reflection -->
      <path d="M210 160 C235 150 265 150 285 165 C265 160 235 160 210 160 Z" fill="#FFFFFF" opacity="0.6"/>
      <!-- Cute star badge on helmet -->
      <polygon points="250,110 254,120 265,120 256,126 259,136 250,130 241,136 244,126 235,120 246,120" fill="#38BDF8"/>
      <!-- Body Suit -->
      <rect x="180" y="290" width="140" height="110" rx="30" fill="url(#helmet)"/>
      <!-- Chest panel -->
      <rect x="220" y="320" width="60" height="40" rx="8" fill="#1E293B"/>
      <circle cx="235" cy="340" r="6" fill="#EF4444"/>
      <circle cx="250" cy="340" r="6" fill="#10B981"/>
      <circle cx="265" cy="340" r="6" fill="#3B82F6"/>
      <!-- Legs & Boots -->
      <rect x="190" y="390" width="45" height="60" rx="15" fill="url(#helmet)"/>
      <rect x="265" y="390" width="45" height="60" rx="15" fill="url(#helmet)"/>
      <ellipse cx="212" cy="455" rx="28" ry="14" fill="#64748B"/>
      <ellipse cx="288" cy="455" rx="28" ry="14" fill="#64748B"/>
    </svg>
  `,
};

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getCharacterTexture(id: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (!CHARACTER_SVGS[id]) return null;

  if (textureCache.has(id)) {
    return textureCache.get(id)!;
  }

  const svgString = CHARACTER_SVGS[id];
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  img.onload = () => {
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
    texture.needsUpdate = true;
    URL.revokeObjectURL(url);
  };
  img.src = url;

  textureCache.set(id, texture);
  return texture;
}
