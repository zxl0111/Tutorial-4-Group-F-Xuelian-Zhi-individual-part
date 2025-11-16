// Commit 3: internal scattered dots become floating + bouncing particles

// Color palettes for the artwork
let colorPalettes = [
  ["#8BC34A", "#81D4FA", "#F48FB1", "#CE93D8", "#FFCC80", "#AED581"],
  ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#FFB300"],
  ["#6A0572", "#AB83A1", "#3C91E6", "#342E37", "#FA824C", "#FF7043"],
  ["#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#264653", "#FFD740"]
];

// Store all wheels so they can animate over time
let circles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(60);
  initLayout(); // use the same layout logic as the group version
}

function initLayout() {
  circles = [];

  background("#1e2c3a");

  // How many circles we want to draw on the screen
  let circleCount = 15;

  // Store placed circles to reduce overlap (same idea as group version)
  let placed = [];

  for (let i = 0; i < circleCount; i++) {
    // Random size for each circle
    let size = random(180, 320);

    // Keep circles away from the edges
    let margin = size * 0.7;
    let x, y;
    let ok = false;
    let tries = 0;

    // Try a few times to avoid heavy overlap
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

    // Only store and draw if we found a reasonable position
    if (ok) {
      let palette = random(colorPalettes);

      // Floating internal dots (replacing static scatter)
      let floatDots = [];
      let floatCount = 26;
      let floatRadiusMax = size * 0.45;
      let floatRadiusMin = size * 0.12;

      for (let j = 0; j < floatCount; j++) {
        let a = random(360);
        let r = random(floatRadiusMin, floatRadiusMax * 0.9);
        let px = cos(a) * r;
        let py = sin(a) * r;

        // SLOWER floating speed, closer to final feeling
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

      // Add animation-related data:
      // spinAngle: current rotation
      // spinDir: +1 or -1 for clockwise / counter-clockwise
      // noiseOffset: base offset for Perlin noise breathing
      circles.push({
        x,
        y,
        size,
        palette,
        spinAngle: random(360),
        spinDir: random([1, -1]),
        noiseOffset: random(1000),
        floatDots,
        floatRadiusMax
      });

      placed.push({ x, y, size });
    }
  }
}

function draw() {
  background("#1e2c3a");

  // Animate each stored circle: breathing + slow spin
  for (let c of circles) {
    updateCircle(c);
    drawCircleAnimated(c);
  }
}

// Update per-circle animation state (spin and floating dots)
function updateCircle(c) {
  // Slow constant spin (aligned with your final version)
  let spinSpeed = 0.08; // degrees per frame
  c.spinAngle += c.spinDir * spinSpeed;

  // Update floating dots with bounce
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

// Draw one animated circle based on the original group design
function drawCircleAnimated(c) {
  push();
  translate(c.x, c.y);

  // Perlin-noise-driven breathing (scale)
  // Slightly different timing for each circle using noiseOffset
  let t = frameCount * 0.004 + c.noiseOffset;
  let n = noise(t);                 // 0..1
  let scaleFactor = 0.9 + n * 0.25; // approx 0.9–1.15
  scale(scaleFactor);

  // Slow spin around its centre
  rotate(c.spinAngle);

  // Draw the original wheel design at the origin
  drawCircleAtOrigin(c);

  pop();
}

// Draw one circle with many patterns, now assuming (0,0) is already translated
function drawCircleAtOrigin(c) {
  let size = c.size;
  let palette = c.palette;

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

  // Ring lines around the circle
  stroke(palette[1]);
  strokeWeight(2);
  noFill();
  for (let r = size * 0.55; r < size * 0.92; r += size * 0.07) {
    ellipse(0, 0, r);
  }

  // Inside dots - colorful (same as commit 2)
  stroke(255);
  strokeWeight(1.4);
  let insideDots = 16;
  for (let i = 0; i < insideDots; i++) {
    let angle = i * (360 / insideDots);
    let px = cos(angle) * (size * 0.38);
    let py = sin(angle) * (size * 0.38);
    fill(random(palette));
    ellipse(px, py, size * 0.09);
  }

  // Enhanced orbital ring with precise dots
  drawOrbitalRing(size, palette);

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

// Draw orbital ring with concentric dots and connecting orbit
function drawOrbitalRing(size, palette) {
  // Use 8-10 concentric dots
  let outerDotCount = floor(random(8, 11));
  let orbitRadius = size * 0.65;

  // Draw connecting orbit dots first
  drawConnectingOrbit(orbitRadius, size, palette, outerDotCount);

  // Then draw the concentric dots
  for (let i = 0; i < outerDotCount; i++) {
    let angle = i * (360 / outerDotCount);
    let px = cos(angle) * orbitRadius;
    let py = sin(angle) * orbitRadius;

    // Draw three-layer concentric dot
    drawConcentricDot(px, py, size * 0.08);
  }
}

// Draw connecting orbit between concentric dots
function drawConnectingOrbit(orbitRadius, size, palette, outerDotCount) {
  // Place 6-8 connecting dots between each concentric dot
  let dotsPerSegment = floor(random(6, 9));
  let totalConnectingDots = outerDotCount * dotsPerSegment;

  for (let i = 0; i < totalConnectingDots; i++) {
    let angle = i * (360 / totalConnectingDots);
    let px = cos(angle) * orbitRadius;
    let py = sin(angle) * orbitRadius;

    // Random size and color for connecting dots
    let dotSize = random(size * 0.015, size * 0.04);
    let dotColor = random(palette);

    noStroke();
    fill(dotColor);
    ellipse(px, py, dotSize);

    // Sometimes add smaller satellite dots
    if (random() > 0.85) {
      let satelliteOffset = random(-size * 0.02, size * 0.02);
      let satelliteX = px + cos(angle * 2) * satelliteOffset;
      let satelliteY = py + sin(angle * 2) * satelliteOffset;

      let satelliteSize = dotSize * 0.6;
      let satelliteColor = random(palette);

      fill(satelliteColor);
      ellipse(satelliteX, satelliteY, satelliteSize);
    }
  }
}

// Draw a three-layer concentric dot
function drawConcentricDot(x, y, baseSize) {
  push();
  translate(x, y);

  // Outer orange ring
  fill("#FF9800");
  noStroke();
  ellipse(0, 0, baseSize);

  // Middle black ring
  fill("#000000");
  ellipse(0, 0, baseSize * 0.7);

  // Center white dot
  fill("#FFFFFF");
  ellipse(0, 0, baseSize * 0.4);

  pop();
}

// Handle window resizing: regenerate layout
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initLayout();
}

// Keyboard interaction - press space to regenerate artwork (new layout)
function keyPressed() {
  if (key === ' ') {
    initLayout();
  }
}