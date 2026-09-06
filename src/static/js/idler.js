/**
 * Ambient background: "Contour Field"
 *
 * Thin nested contour lines trace level curves of one continuous,
 * slowly-drifting 2D value-noise surface, marched with a classic
 * marching-squares pass on a coarse grid. Every line on screen is a
 * cross-section of the SAME field at a fixed elevation, so neighboring
 * contours are geometrically correlated (they nest, they never cross,
 * they bulge and pinch together) -- it reads as one continuous terrain
 * rather than a scatter of independent strokes. Nods to the site
 * owner's geospatial / data-surface work (watershed + elevation
 * surfaces) without being literal about it.
 */
(function () {
  "use strict";

  var container = document.getElementById("bg");
  if (!container) return;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------
  // Value noise (hash lattice + smooth interpolation), no dependency.
  // ---------------------------------------------------------------
  var PERM_SIZE = 256;
  var PERM_MASK = PERM_SIZE - 1;
  var perm = new Uint8Array(PERM_SIZE);
  (function buildPermutation() {
    var table = new Uint8Array(PERM_SIZE);
    for (var i = 0; i < PERM_SIZE; i++) table[i] = i;
    for (var j = PERM_SIZE - 1; j > 0; j--) {
      var k = (Math.random() * (j + 1)) | 0;
      var tmp = table[j];
      table[j] = table[k];
      table[k] = tmp;
    }
    perm.set(table);
  })();

  function lattice(ix, iy) {
    var a = perm[ix & PERM_MASK];
    return perm[(a + iy) & PERM_MASK] / 255;
  }

  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function noise2D(x, y) {
    var xi = Math.floor(x);
    var yi = Math.floor(y);
    var xf = x - xi;
    var yf = y - yi;
    var u = fade(xf);
    var v = fade(yf);
    var n00 = lattice(xi, yi);
    var n10 = lattice(xi + 1, yi);
    var n01 = lattice(xi, yi + 1);
    var n11 = lattice(xi + 1, yi + 1);
    var nx0 = n00 + (n10 - n00) * u;
    var nx1 = n01 + (n11 - n01) * u;
    return nx0 + (nx1 - nx0) * v;
  }

  // Two-octave fractal sum, warped slightly so the field folds and
  // breathes rather than just sliding sideways.
  var FREQ_1 = 1 / 460; // px per full noise cycle, octave 1
  var FREQ_2 = FREQ_1 * 2.3; // octave 2
  function fieldValue(x, y, driftX, driftY, warpX, warpY) {
    var n1 = noise2D((x + driftX) * FREQ_1, (y + driftY) * FREQ_1);
    var n2 = noise2D(
      (x + driftX + warpX) * FREQ_2,
      (y + driftY + warpY) * FREQ_2
    );
    var fbm = n1 * 0.68 + n2 * 0.32; // ~[0,1]
    return fbm * 2 - 1; // ~[-1,1], centered
  }

  // ---------------------------------------------------------------
  // Marching squares
  // Corner bit order: v0=top-left, v1=top-right, v2=bottom-right, v3=bottom-left
  // Edge order: 0=top, 1=right, 2=bottom, 3=left
  // ---------------------------------------------------------------
  var CASE_EDGES = [
    null, // 0
    [0, 3], // 1
    [0, 1], // 2
    [1, 3], // 3
    [1, 2], // 4
    [0, 3, 1, 2], // 5 (saddle, two segments)
    [0, 2], // 6
    [2, 3], // 7
    [2, 3], // 8
    [0, 2], // 9
    [0, 1, 2, 3], // 10 (saddle, two segments)
    [1, 2], // 11
    [1, 3], // 12
    [0, 1], // 13
    [0, 3], // 14
    null, // 15
  ];

  function edgePoint(edge, x, y, cell, v0, v1, v2, v3, threshold) {
    var t;
    switch (edge) {
      case 0: // top: v0 -> v1
        t = (threshold - v0) / (v1 - v0 || 1e-6);
        return [x + cell * t, y];
      case 1: // right: v1 -> v2
        t = (threshold - v1) / (v2 - v1 || 1e-6);
        return [x + cell, y + cell * t];
      case 2: // bottom: v3 -> v2
        t = (threshold - v3) / (v2 - v3 || 1e-6);
        return [x + cell * t, y + cell];
      case 3: // left: v0 -> v3
        t = (threshold - v0) / (v3 - v0 || 1e-6);
        return [x, y + cell * t];
    }
  }

  // ---------------------------------------------------------------
  // Layout state
  // ---------------------------------------------------------------
  var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  var width = 0;
  var height = 0;
  var cellSize = 28;
  var cols = 0;
  var rows = 0;
  var grid = null; // Float32Array of (cols+1)*(rows+1)

  var LEVELS = [-0.5, -0.333, -0.167, 0, 0.167, 0.333, 0.5];
  var BASE_COLOR = "233,230,223"; // --ink
  var ACCENT_COLOR = "217,100,92"; // --accent-bright, reserved for the zero contour

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var targetCols = 68;
    cellSize = Math.max(22, width / targetCols);
    cols = Math.ceil(width / cellSize) + 1;
    rows = Math.ceil(height / cellSize) + 1;
    grid = new Float32Array((cols + 1) * (rows + 1));
  }

  function sampleGrid(driftX, driftY, warpX, warpY) {
    var idx = 0;
    for (var ry = 0; ry <= rows; ry++) {
      var y = ry * cellSize;
      for (var rx = 0; rx <= cols; rx++) {
        var x = rx * cellSize;
        grid[idx++] = fieldValue(x, y, driftX, driftY, warpX, warpY);
      }
    }
  }

  function drawContours() {
    var stride = cols + 1;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (var li = 0; li < LEVELS.length; li++) {
      var threshold = LEVELS[li];
      var isZero = threshold === 0;
      var depth = Math.abs(threshold) / 0.5; // 0 (center) .. 1 (outer)
      var alpha = isZero ? 0.5 : 0.3 + 0.16 * (1 - depth);
      ctx.strokeStyle = isZero
        ? "rgba(" + ACCENT_COLOR + "," + alpha + ")"
        : "rgba(" + BASE_COLOR + "," + alpha + ")";
      ctx.lineWidth = isZero ? 1.3 : 1;

      ctx.beginPath();
      for (var cy = 0; cy < rows; cy++) {
        var rowOff = cy * stride;
        var rowOffNext = rowOff + stride;
        var y = cy * cellSize;
        for (var cx = 0; cx < cols; cx++) {
          var x = cx * cellSize;
          var v0 = grid[rowOff + cx];
          var v1 = grid[rowOff + cx + 1];
          var v2 = grid[rowOffNext + cx + 1];
          var v3 = grid[rowOffNext + cx];

          var caseIndex =
            (v0 >= threshold ? 1 : 0) |
            (v1 >= threshold ? 2 : 0) |
            (v2 >= threshold ? 4 : 0) |
            (v3 >= threshold ? 8 : 0);

          var edges = CASE_EDGES[caseIndex];
          if (!edges) continue;

          for (var s = 0; s < edges.length; s += 2) {
            var p0 = edgePoint(edges[s], x, y, cellSize, v0, v1, v2, v3, threshold);
            var p1 = edgePoint(
              edges[s + 1],
              x,
              y,
              cellSize,
              v0,
              v1,
              v2,
              v3,
              threshold
            );
            ctx.moveTo(p0[0], p0[1]);
            ctx.lineTo(p1[0], p1[1]);
          }
        }
      }
      ctx.stroke();
    }
  }

  function render(driftX, driftY, warpX, warpY) {
    ctx.clearRect(0, 0, width, height);
    sampleGrid(driftX, driftY, warpX, warpY);
    drawContours();
  }

  // ---------------------------------------------------------------
  // Animation: slow drift, throttled to a modest frame rate since the
  // motion itself unfolds over tens of seconds -- no need to sample it
  // faster than that.
  // ---------------------------------------------------------------
  var DRIFT_VX = 3.2; // px/sec
  var DRIFT_VY = -2.1; // px/sec
  var startTime = null;
  var lastFrameTime = 0;
  var FRAME_INTERVAL = 1000 / 15; // ~15fps grid refresh, plenty for slow drift
  var rafId = null;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (now - lastFrameTime < FRAME_INTERVAL) return;
    lastFrameTime = now;
    if (startTime === null) startTime = now;
    var t = (now - startTime) / 1000;

    var driftX = t * DRIFT_VX;
    var driftY = t * DRIFT_VY;
    var warpX = Math.sin(t * 0.013) * 60;
    var warpY = Math.cos(t * 0.009) * 60;
    render(driftX, driftY, warpX, warpY);
  }

  function start() {
    resize();
    if (reduceMotion) {
      render(0, 0, 0, 0);
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduceMotion) render(0, 0, 0, 0);
    }, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (reduceMotion) return;
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (rafId === null) {
      lastFrameTime = 0;
      rafId = requestAnimationFrame(frame);
    }
  });

  start();
})();
