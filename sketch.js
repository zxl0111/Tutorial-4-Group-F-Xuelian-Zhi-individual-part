// Commit 5: inner 6 rings reveal from inside to outside, and 16 inner dots reveal directionally (same direction as orbital ring)

// Color palettes for the artwork
let colorPalettes = [
  ["#8BC34A", "#81D4FA", "#F48FB1", "#CE93D8", "#FFCC80", "#AED581"],
  ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#FFB300"],
  ["#6A0572", "#AB83A1", "#3C91E6", "#342E37", "#FA824C", "#FF7043"],
  ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#264653", "#FFD740"]
];

let circles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(60);
  initLayout();
}

function initLayout() {
  circles = [];
  background("#1e2c3a");

  let circleCount = 15;
  let placed = [];

  for (let i = 0; i < circleCount; i++) {
    let size = random(180, 320);

    let margin = size * 0.7;
    let x, y;
    let ok = false;
    let tries = 0;

    while (!ok && tries < 200) {
      x = random(margin, width - margin);
      y = random(margin, height - margin);
      ok = true;

      for (let c of placed) {
        let d = dist(x, y, c.x, c.y);
        let minDist = (size * 0.5 + c.size * 0.5) * 0.9;
        if (d < minDist) {
          ok = false;
          break;
        }
      }
      tries++;
    }

    if (ok) {
      let palette = random(colorPalettes);

      // Floating internal dots
      let floatDots = [];
      let floatCount = 26;
      let floatRadiusMax = size * 0.45;
      let floatRadiusMin = size * 0.12;

      for (let j = 0; j < floatCount; j++) {
        let a = random(360);
        let r = random(floatRadiusMin, floatRadiusMax * 0.9);
        let px = cos(a) * r;
        let py = sin(a) * r;

        let speed = random(0.12, 0.35);
        let dir = random(360);
        let vx = cos(dir) * speed;
        let vy = sin(dir) * speed;

        floatDots.push({
          x: px,
          y: py,
          vx,
          vy,
          color: random(palette)
        });
      }

      let spinDir = random([1, -1]);

      circles.push({
        x,
        y,
        size,
        palette,
        spinAngle: random(360),
        spinDir: spinDir,
        noiseOffset: random(1000),
        floatDots,
        floatRadiusMax,
        orbitDir: -spinDir, // reveal direction opposite to spin
        revealPhase: 0      // 0 → 1 loop for orbital / rings / inner dots
      });

      placed.push({ x, y, size });
    }
  }
}

function draw() {
  background("#1e2c3a");

  for (let c of circles) {
    updateCircle(c);
    drawCircleAnimated(c);
  }
}

function updateCircle(c) {
  // Slow constant spin
  let spinSpeed = 0.08;
  c.spinAngle += c.spinDir * spinSpeed;

  // Reveal phase loop
  let revealSpeed = 0.004; // about 4s per loop
  c.revealPhase = (c.revealPhase + revealSpeed) % 1;

  // Floating dots with bounce
  for (let d of c.floatDots) {
    d.x += d.vx;
    d.y += d.vy;

    let distFromCenter = sqrt(d.x * d.x + d.y * d.y);

    if (distFromCenter > c.floatRadiusMax) {
      let nx = d.x / distFromCenter;
      let ny = d.y / distFromCenter;

      let vDotN = d.vx * nx + d.vy * ny;
      d.vx -= 2 * vDotN * nx;
      d.vy -= 2 * vDotN * ny;

      d.x = nx * c.floatRadiusMax;
      d.y = ny * c.floatRadiusMax;
    }
  }
}

function drawCircleAnimated(c) {
  push();
  translate(c.x, c.y);

  // Breathing scale (Perlin noise)
  let t = frameCount * 0.004 + c.noiseOffset;
  let n = noise(t);
  let scaleFactor = 0.9 + n * 0.25;
  scale(scaleFactor);

  // Spin
  rotate(c.spinAngle);

  drawCircleAtOrigin(c);

  pop();
}

function drawCircleAtOrigin(c) {
  let size = c.size;
  let palette = c.palette;
  randomSeed(floor(c.noiseOffset * 10000));
  
  // Background glow
  noStroke();
  fill(255, 255, 255, 35);
  ellipse(0, 0, size * 1.18);

  // Main circle
  fill(palette[0]);
  ellipse(0, 0, size);

  // Floating small colorful dots inside the big circle
  for (let d of c.floatDots) {
    noStroke();
    fill(d.color);
    ellipse(d.x, d.y, size * 0.04);
  }

  // RING LINES: 6 rings reveal from inner to outer (using revealPhase)
  stroke(palette[1]);
  strokeWeight(2);
  noFill();

  let innerStart = size * 0.55;
  let innerEnd = size * 0.92;
  let step = size * 0.07;

  let ringRadii = [];
  for (let r = innerStart; r < innerEnd; r += step) {
    ringRadii.push(r);
  }
  let totalRings = ringRadii.length;
  let outerIndex = totalRings - 1;

  // which ring index is currently visible (0..totalRings-1)
  let ringVisibleIndex = floor(c.revealPhase * totalRings);
  if (ringVisibleIndex < 0) ringVisibleIndex = 0;
  if (ringVisibleIndex > outerIndex) ringVisibleIndex = outerIndex;

  for (let j = 0; j < totalRings; j++) {
    if (j <= ringVisibleIndex) {
      ellipse(0, 0, ringRadii[j]);
    }
  }

  // INSIDE DOTS: 16 dots reveal in the same direction as orbital ring
  stroke(255);
  strokeWeight(1.4);
  let insideDots = 16;

  // how many dots should be visible at current phase
  let dotCount = floor(c.revealPhase * insideDots) + 1;
  if (dotCount > insideDots) dotCount = insideDots;

  for (let i = 0; i < insideDots; i++) {
    let visible = false;

    if (c.orbitDir > 0) {
      // clockwise: light from index 0 upwards
      visible = i < dotCount;
    } else {
      // counter-clockwise: light from the end backwards
      visible = i >= insideDots - dotCount;
    }

    if (!visible) continue;

    let angle = i * (360 / insideDots);
    let px = cos(angle) * (size * 0.38);
    let py = sin(angle) * (size * 0.38);
    fill(random(palette));
    ellipse(px, py, size * 0.09);
  }

  // Orbital ring with directional reveal (same as commit 4)
  drawOrbitalRingReveal(c);

  // 8 lines like wheel spokes
  stroke("#FFFFFF");
  strokeWeight(2);
  for (let i = 0; i < 8; i++) {
    let angle = i * 45;
    let px = cos(angle) * (size * 0.43);
    let py = sin(angle) * (size * 0.43);
    line(0, 0, px, py);
  }

  // Center dots
  fill("#FAFAFA");
  stroke("#FFFFFF");
  strokeWeight(2);
  ellipse(0, 0, size * 0.15);
  noStroke();
  fill(palette[2]);
  ellipse(0, 0, size * 0.07);
}

// Orbital ring with gradual reveal, direction opposite to spinDir
function drawOrbitalRingReveal(c) {
  let size = c.size;
  let palette = c.palette;
  let outerDotCount = 9;
  let orbitRadius = size * 0.65;
  let dir = c.orbitDir;
  let phase = c.revealPhase;

  let dotsPerSegment = 7;
  let totalConnectingDots = outerDotCount * dotsPerSegment;

  // Connecting dots
  for (let i = 0; i < totalConnectingDots; i++) {
    let angle = i * (360 / totalConnectingDots);
    let norm = angle / 360.0;

    let visible = false;
    if (dir > 0) {
      visible = norm <= phase;
    } else {
      visible = norm >= 1.0 - phase;
    }

    if (!visible) continue;

    let px = cos(angle) * orbitRadius;
    let py = sin(angle) * orbitRadius;

    let dotSize = random(size * 0.015, size * 0.04);
    let dotColor = random(palette);

    noStroke();
    fill(dotColor);
    ellipse(px, py, dotSize);
  }

  // Main concentric dots on orbit
  for (let i = 0; i < outerDotCount; i++) {
    let angle = i * (360 / outerDotCount);
    let norm = angle / 360.0;

    let visible = false;
    if (dir > 0) {
      visible = norm <= phase;
    } else {
      visible = norm >= 1.0 - phase;
    }

    if (!visible) continue;

    let px = cos(angle) * orbitRadius;
    let py = sin(angle) * orbitRadius;

    drawConcentricDot(px, py, size * 0.08);
  }
}

function drawConcentricDot(x, y, baseSize) {
  push();
  translate(x, y);

  fill("#FF9800");
  noStroke();
  ellipse(0, 0, baseSize);

  fill("#000000");
  ellipse(0, 0, baseSize * 0.7);

  fill("#FFFFFF");
  ellipse(0, 0, baseSize * 0.4);

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLayout();
}

function keyPressed() {
  if (key === ' ') {
    initLayout();
  }
}