document.addEventListener('DOMContentLoaded', () => {
if (window.app && window.app.destroy) {
  window.app.destroy(true, { children: true, texture: true, baseTexture: true });
}

let canvas = document.getElementById('anim');

if (!canvas) {
  canvas = document.createElement('canvas');
  canvas.id = 'anim';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '1';
  canvas.style.zIndex = '-1';
  document.body.insertBefore(canvas, document.body.firstChild);
}

const app = new PIXI.Application({
  view: canvas,
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,  // Configuración de transparencia en Pixi v5
  autoDensity: true,
  resolution: window.devicePixelRatio || 1,
  resizeTo: window
});

window.app = app; // global scope

const PALETA_DARK = ['#78ceed', '#1770a8', '#89ad58', '#2f844c', '#f5d03b', '#e59744', '#d54435'];
const PALETA_LIGHT = ['#4ca8cc', '#1770a8', '#638c35', '#2f844c', '#d6aa15', '#cb711f', '#d54435'];

let paletaActual = [];

function HexToRGBArray(hexArray) {
  return hexArray.map(hex => {
    const num = parseInt(hex.replace('#', ''), 16);
    return {
      r: (num >> 16) & 255,
                      g: (num >> 8) & 255,
                      b: num & 255
    };
  });
}

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function updatePalette() {
  paletaActual = HexToRGBArray(darkModeMediaQuery.matches ? PALETA_DARK : PALETA_LIGHT);
}
updatePalette();
darkModeMediaQuery.addEventListener('change', updatePalette);

// baseline grid
const CELL_SIZE = 14;
const GAP = 20;
const TOTAL_CELL_SIZE = CELL_SIZE + GAP;

let COLS, ROWS, TOTAL_POSITIONS, TOTAL_PARTICLES;
let offsetX, offsetY;
let availableSlots = [];

const shadowsContainer = new PIXI.Container();
const squaresContainer = new PIXI.Container();

app.stage.addChild(shadowsContainer);
app.stage.addChild(squaresContainer);

// each square
const graphics = new PIXI.Graphics();
graphics.beginFill(0xffffff);
graphics.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
graphics.endFill();
const texture = app.renderer.generateTexture(graphics);

const particles = [];

function updateGridDimensions() {
  COLS = Math.floor(window.innerWidth / TOTAL_CELL_SIZE);
  ROWS = Math.floor(window.innerHeight / TOTAL_CELL_SIZE);
  TOTAL_POSITIONS = COLS * ROWS;
  TOTAL_PARTICLES = Math.min(125, TOTAL_POSITIONS);

  offsetX = (window.innerWidth - (COLS * TOTAL_CELL_SIZE - GAP)) / 2;
  offsetY = (window.innerHeight - (ROWS * TOTAL_CELL_SIZE - GAP)) / 2;

  availableSlots = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      availableSlots.push({ col: c, row: r });
    }
  }

  for (let i = availableSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
  }
}

updateGridDimensions();

function getRandomWaitTime() {
  return Math.floor(60 + Math.random() * 180);
}

for (let i = 0; i < TOTAL_PARTICLES; i++) {
  const slot = availableSlots[i];
  const posX = offsetX + slot.col * TOTAL_CELL_SIZE;
  const posY = offsetY + slot.row * TOTAL_CELL_SIZE;

  const sprite = new PIXI.Sprite(texture);
  sprite.x = posX;
  sprite.y = posY;

  const shadowGraphic = new PIXI.Graphics();

  const progress = Math.random() * PALETA_DARK.length;
  sprite.tint = getColorFromPalette(progress);

  squaresContainer.addChild(sprite);
  shadowsContainer.addChild(shadowGraphic);

  const initialAngle = Math.random() * Math.PI * 2;
  const initialLength = 20 + Math.random() * 25;
  const initialScale = 1.8 + Math.random() * 1.2;

  particles.push({
    sprite,
    shadowGraphic,
    progress,
    x: posX,
    y: posY,

    currentAngle: initialAngle,
    targetAngle: initialAngle,
    currentLength: initialLength,
    targetLength: initialLength,
    currentScale: initialScale,
    targetScale: initialScale,

    waitTime: getRandomWaitTime(),
                 isMoving: false
  });
}

function onResize() {
  updateGridDimensions();

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (i < TOTAL_POSITIONS) {
      const slot = availableSlots[i];
      p.x = offsetX + slot.col * TOTAL_CELL_SIZE;
      p.y = offsetY + slot.row * TOTAL_CELL_SIZE;

      p.sprite.x = p.x;
      p.sprite.y = p.y;

      p.sprite.visible = true;
      p.shadowGraphic.visible = true;
    } else {
      p.sprite.visible = false;
      p.shadowGraphic.visible = false;
    }
  }
}

window.addEventListener('resize', onResize);

function getColorFromPalette(progress) {
  const len = paletaActual.length;
  const norm = (progress % len + len) % len;

  const index1 = Math.floor(norm);
  const index2 = (index1 + 1) % len;
  const factor = norm - index1;

  const c1 = paletaActual[index1];
  const c2 = paletaActual[index2];

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return (r << 16) | (g << 8) | b;
}

function drawScaledShadow(graphic, x, y, size, angle, length, scaleFactor, color) {
  graphic.clear();

  const dx = Math.cos(angle) * length;
  const dy = Math.sin(angle) * length;

  const cx = x + size / 2;
  const cy = y + size / 2;

  const basePoints = [
    { x: x, y: y },
    { x: x + size, y: y },
    { x: x + size, y: y + size },
    { x: x, y: y + size }
  ];

  const targetCx = cx + dx;
  const targetCy = cy + dy;

  const scaledHalfSize = (size * scaleFactor) / 2;
  const projectedPoints = [
    { x: targetCx - scaledHalfSize, y: targetCy - scaledHalfSize },
    { x: targetCx + scaledHalfSize, y: targetCy - scaledHalfSize },
    { x: targetCx + scaledHalfSize, y: targetCy + scaledHalfSize },
    { x: targetCx - scaledHalfSize, y: targetCy + scaledHalfSize }
  ];

  const allPoints = [...basePoints, ...projectedPoints];

  allPoints.sort((a, b) => a.x == b.x ? a.y - b.y : a.x - b.x);

  const crossProduct = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower = [];
  for (let p of allPoints) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = allPoints.length - 1; i >= 0; i--) {
    const p = allPoints[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  const hull = lower.concat(upper);

  const polygonPath = [];
  hull.forEach(p => polygonPath.push(p.x, p.y));

  graphic.beginFill(color, 0);
  graphic.lineStyle(1, color, 0.33);
  graphic.drawPolygon(polygonPath);
  graphic.endFill();
}

// render loop
app.ticker.add(() => {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.sprite.visible) continue;

    p.progress += 0.004;
    const currentColor = getColorFromPalette(p.progress);
    p.sprite.tint = currentColor;

    if (!p.isMoving) {
      p.waitTime--;

      if (p.waitTime <= 0) {
        p.targetAngle = Math.random() * Math.PI * 2;
        p.targetLength = 20 + Math.random() * 30;
        p.targetScale = 1.8 + Math.random() * 1.4;
        p.isMoving = true;
      }
    } else {
      p.currentAngle += (p.targetAngle - p.currentAngle) * 0.05;
      p.currentLength += (p.targetLength - p.currentLength) * 0.05;
      p.currentScale += (p.targetScale - p.currentScale) * 0.05;

      const angleDiff = Math.abs(p.targetAngle - p.currentAngle);
      const lengthDiff = Math.abs(p.targetLength - p.currentLength);

      if (angleDiff < 0.01 && lengthDiff < 0.1) {
        p.currentAngle = p.targetAngle;
        p.currentLength = p.targetLength;
        p.currentScale = p.targetScale;
        p.isMoving = false;
        p.waitTime = getRandomWaitTime();
      }
    }

    drawScaledShadow(
      p.shadowGraphic,
      p.x,
      p.y,
      CELL_SIZE,
      p.currentAngle,
      p.currentLength,
      p.currentScale,
      currentColor
    );
  }
});
});
