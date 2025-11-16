// Pacita Abad "Wheels of Fortune" – Individual Animated Version
// Personal task: Perlin-noise-driven breathing + randomness + time-based reveal.

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

// Build layout and data for all wheels (starting from the group static version)
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

    // Simple overlap-avoidance: try random positions until wheels do not overlap too much.
    // This logic is adapted from typical “no-overlap placement” patterns in generative art.
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

      // Floating internal dots: each wheel stores its own small particles.
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

      // Extra design: assign each wheel to one of three breathing groups.
      // Group-based Perlin breathing uses different noise speeds and amplitudes.
      // Perlin noise reference: https://p5js.org/reference/p5/noise/ https://p5js.org/examples/repetition-noise/
      let groupId = floor(random(3)); // breathing group 0,1,2

      circles.push({
        x,
        y,
        size,
        palette,
        spinAngle: random(360),
        spinDir: spinDir,
        noiseOffset: random(1000),  // different phase for noise per wheel
        floatDots,
        floatRadiusMax,
        orbitDir: -spinDir,         // reveal direction opposite to spin
        revealPhase: 0,             // 0 → 1 loop for orbital / rings / inner dots
        groupId: groupId            // grouped breathing
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
  // Slow constant spin for each wheel (time-based, not user input).
  let spinSpeed = 0.08;
  c.spinAngle += c.spinDir * spinSpeed;

  // Reveal phase loop: 0 → 1 → 0 → …, used to reveal rings and dots.
  // This is a custom time-based reveal design, not taken from a specific tutorial.
  let revealSpeed = 0.004; // about 4s per loop
  c.revealPhase = (c.revealPhase + revealSpeed) % 1;

  // Floating dots with bounce inside a circular boundary
  for (let d of c.floatDots) {
    d.x += d.vx;
    d.y += d.vy;

    let distFromCenter = sqrt(d.x * d.x + d.y * d.y);

    if (distFromCenter > c.floatRadiusMax) {
      // Normal vector on the circle boundary (from center to dot)
      let nx = d.x / distFromCenter;
      let ny = d.y / distFromCenter;

      // Reflect velocity across the normal:
      // v' = v - 2 * (v · n) * n
      // This reflection technique is based on the standard vector reflection formula:
      // https://en.wikipedia.org/wiki/Reflection_(mathematics)
      // similar to the p5.js example “Non-Orthogonal Reflection”:
      // https://p5js.org/examples/math-and-physics-non-orthogonal-reflection/
      let vDotN = d.vx * nx + d.vy * ny;
      d.vx -= 2 * vDotN * nx;
      d.vy -= 2 * vDotN * ny;

      // Move the dot back onto the boundary so it does not get stuck outside.
      d.x = nx * c.floatRadiusMax;
      d.y = ny * c.floatRadiusMax;
    }
  }
}

function drawCircleAnimated(c) {
  push();
  translate(c.x, c.y);

  // Grouped breathing: 3 groups with slightly different noise speed & amplitude.
  // This is a custom use of Perlin noise to create clustered but non-uniform motion.
  // Perlin noise reference: https://p5js.org/reference/p5/noise/ https://p5js.org/examples/repetition-noise/
  let speeds = [0.0035, 0.0045, 0.0055];
  let amounts = [0.26, 0.32, 0.38];
  let g = c.groupId || 0;
  let breathSpeed = speeds[g % speeds.length];
  let breathAmount = amounts[g % amounts.length];

  let breathNoise = noise(frameCount * breathSpeed + c.noiseOffset);
  let scaleFactor = 0.78 + breathNoise * breathAmount;
  scale(scaleFactor);

  // Spin around the centre of each wheel
  rotate(c.spinAngle);

  drawCircleAtOrigin(c);

  pop();
}

function drawCircleAtOrigin(c) {
  let size = c.size;
  let palette = c.palette;

  // Lock random pattern inside this wheel so colours stay stable across frames.
  // randomSeed ensures random() returns the same sequence each frame for this wheel.
  // randomSeed reference: https://p5js.org/reference/p5/randomSeed/
  randomSeed(floor(c.noiseOffset * 10000));

  // Background glow
  noStroke();
  fill(255, 255, 255, 35);
  ellipse(0, 0, size * 1.18);

  // Main circle
  fill(palette[0]);
  ellipse(0, 0, size);

  // Floating small colorful dots inside the big circle (positions updated in updateCircle)
  for (let d of c.floatDots) {
    noStroke();
    fill(d.color);
    ellipse(d.x, d.y, size * 0.04);
  }

  // 6 inner rings: reveal from inner to outer using revealPhase 
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

  // Time-based reveal: map a 0–1 phase value to a discrete ring index (0..N-1).
  // This phased reveal logic is custom for this project (not copied from an external source).
  let ringVisibleIndex = floor(c.revealPhase * totalRings);
  if (ringVisibleIndex < 0) ringVisibleIndex = 0;
  if (ringVisibleIndex > outerIndex) ringVisibleIndex = outerIndex;

  for (let j = 0; j < totalRings; j++) {
    if (j <= ringVisibleIndex) {
      ellipse(0, 0, ringRadii[j]);
    }
  }

  // 16 inner dots: reveal along the ring in same direction as orbital ring
  stroke(255);
  strokeWeight(1.4);
  let insideDots = 16;

  let dotCount = floor(c.revealPhase * insideDots) + 1;
  if (dotCount > insideDots) dotCount = insideDots;

  for (let i = 0; i < insideDots; i++) {
    let visible = false;

    if (c.orbitDir > 0) {
      // clockwise: reveal from index 0 upwards
      visible = i < dotCount;
    } else {
      // counter-clockwise: reveal from the last index backwards
      visible = i >= insideDots - dotCount;
    }

    if (!visible) continue;

    let angle = i * (360 / insideDots);
    let px = cos(angle) * (size * 0.38);
    let py = sin(angle) * (size * 0.38);
    fill(random(palette));
    ellipse(px, py, size * 0.09);
  }

  // Outer orbital ring dots with directional reveal
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

// Orbital ring with gradual reveal, direction opposite to spinDir.
function drawOrbitalRingReveal(c) {
  let size = c.size;
  let palette = c.palette;
  let outerDotCount = 9;
  let orbitRadius = size * 0.65;
  let dir = c.orbitDir;
  let phase = c.revealPhase;

  let dotsPerSegment = 7;
  let totalConnectingDots = outerDotCount * dotsPerSegment;

  // Connecting dots along the orbit.
  // Directional reveal is based on normalized angle [0,1] and phase.
  // This is a custom time-based design using angles; not taken from a specific tutorial.
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

  // Main concentric dots on orbit, using the same directional reveal logic.
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