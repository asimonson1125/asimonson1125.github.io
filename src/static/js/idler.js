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
  var LOW_COLOR = [233, 230, 223]; // --ink, lowest elevation band
  // A punchier red than --accent-bright (217,100,92) -- the .site overlay's
  // ~90% dilution desaturates whatever reaches it, so the top of the ramp
  // needs to start more saturated than it should ever look at full opacity.
  var HIGH_COLOR = [235, 70, 55];

  // Two independent master levers: turn either down to quiet that part of
  // the effect without touching the per-level tuning below. LINE_INTENSITY
  // scales the contour strokes; FILL_INTENSITY scales the hypsometric wash
  // between them (the fill covers far more area, so it wants a much lower
  // resting value or the whole page tints).
  var LINE_INTENSITY = 1;
  var FILL_INTENSITY = 0.35;
  // Fill is parked off for now (color/palette still being worked out) --
  // the lines are the finished part. Flip this back on to resume tuning
  // the fill without re-deriving any of the code below.
  var FILL_ENABLED = false;

  // Shared ink -> accent ramp, used by both the contour lines and the fill
  // bands so they read as one coherent palette. `rank` is the band's
  // position (0 = lowest), `count` the total number of bands on that scale.
  // sqrt-biases toward color early, since a flat ramp only ever colors the
  // single highest band.
  function levelColor(rank, count) {
    var t = Math.sqrt(rank / (count - 1));
    return [
      Math.round(LOW_COLOR[0] + (HIGH_COLOR[0] - LOW_COLOR[0]) * t),
      Math.round(LOW_COLOR[1] + (HIGH_COLOR[1] - LOW_COLOR[1]) * t),
      Math.round(LOW_COLOR[2] + (HIGH_COLOR[2] - LOW_COLOR[2]) * t),
    ];
  }

  // How many of LEVELS a value clears -- 0 (below every threshold) through
  // LEVELS.length (above all of them). LEVELS is sorted ascending.
  function bandIndex(v) {
    var idx = 0;
    for (var i = 0; i < LEVELS.length; i++) {
      if (v >= LEVELS[i]) idx = i + 1;
    }
    return idx;
  }

  var FILL_BANDS = LEVELS.length + 1;
  var bandColors = null; // precomputed once, reused every frame
  function buildBandColors() {
    bandColors = [];
    for (var i = 0; i < FILL_BANDS; i++) bandColors.push(levelColor(i, FILL_BANDS));
  }
  buildBandColors();

  // Samples per grid cell edge for the fill raster. Higher tracks the
  // contour lines more precisely (at some per-frame cost); 4 keeps the
  // boundary error under a few px, invisible once bilinear-upscaled.
  var FILL_SUBDIV = 3;
  var fillCanvas = document.createElement("canvas");
  var fillCtx = fillCanvas.getContext("2d");
  var fillImage = null;
  var fillCols = 0;
  var fillRows = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Denser than the original line-only version needed: chaining +
    // quadratic smoothing can only curve as finely as the underlying
    // vertices allow, and at ~22px spacing sharp field bends still showed
    // as visible facets (the actual cause of the "depth"/faceted look --
    // confirmed by eye, not just measured).
    var targetCols = 130;
    cellSize = Math.max(11, width / targetCols);
    cols = Math.ceil(width / cellSize) + 1;
    rows = Math.ceil(height / cellSize) + 1;
    grid = new Float32Array((cols + 1) * (rows + 1));

    fillCols = cols * FILL_SUBDIV;
    fillRows = rows * FILL_SUBDIV;
    fillCanvas.width = fillCols;
    fillCanvas.height = fillRows;
    fillImage = fillCtx.createImageData(fillCols, fillRows);
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

  // Hypsometric wash: for each fill-raster sample, bilinearly interpolate
  // the RAW field value from its cell's four corners -- the same linear
  // interpolation marching squares uses internally to place a line -- then
  // band/color that interpolated value. Coloring first and blending colors
  // second (as an earlier version did) is a different operation and drifts
  // from the true boundary wherever a cell spans more than one threshold;
  // interpolating the value first keeps fill and line mathematically tied
  // to the same crossing.
  function drawFill() {
    var stride = cols + 1;
    var pixels = fillImage.data;
    var p = 0;
    for (var ry = 0; ry < fillRows; ry++) {
      var cy = Math.min(rows - 1, (ry / FILL_SUBDIV) | 0);
      var fy = (ry - cy * FILL_SUBDIV) / FILL_SUBDIV;
      var rowOff = cy * stride;
      var rowOffNext = rowOff + stride;
      for (var rx = 0; rx < fillCols; rx++) {
        var cx = Math.min(cols - 1, (rx / FILL_SUBDIV) | 0);
        var fx = (rx - cx * FILL_SUBDIV) / FILL_SUBDIV;

        var v0 = grid[rowOff + cx];
        var v1 = grid[rowOff + cx + 1];
        var v2 = grid[rowOffNext + cx + 1];
        var v3 = grid[rowOffNext + cx];

        var top = v0 + (v1 - v0) * fx;
        var bottom = v3 + (v2 - v3) * fx;
        var value = top + (bottom - top) * fy;

        var c = bandColors[bandIndex(value)];
        pixels[p++] = c[0];
        pixels[p++] = c[1];
        pixels[p++] = c[2];
        pixels[p++] = 255;
      }
    }
    fillCtx.putImageData(fillImage, 0, 0);

    var alpha = Math.max(0, Math.min(1, FILL_INTENSITY));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fillCanvas, 0, 0, fillCols, fillRows, 0, 0, width, height);
    ctx.restore();
  }

  // Marching squares gives independent 2-point segments per cell, with no
  // record of which segments abut. Stroking them as-is (one moveTo/lineTo
  // subpath per segment) means lineJoin never gets a chance to apply, so
  // every cell boundary shows as a hard facet. Chain segments that share
  // an endpoint into continuous polylines/loops first, then stroke each
  // chain as a quadratic-smoothed curve through its points -- an actually
  // curved line instead of a connect-the-dots polygon.
  var CHAIN_EPS = 0.02; // px; two crossings on the same shared edge should
                          // land on (near-)identical floats, see note below
  function pointKey(p) {
    return Math.round(p[0] / CHAIN_EPS) + "_" + Math.round(p[1] / CHAIN_EPS);
  }

  function collectSegments(threshold) {
    var stride = cols + 1;
    var segments = [];
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
          var p1 = edgePoint(edges[s + 1], x, y, cellSize, v0, v1, v2, v3, threshold);
          segments.push([p0, p1]);
        }
      }
    }
    return segments;
  }

  // Two adjacent cells that share a grid edge compute that edge's crossing
  // point from the same two corner values via the same formula (verified:
  // cell (cx,cy)'s right edge and cell (cx+1,cy)'s left edge reduce to an
  // identical t), so their coordinates match to float precision -- rounding
  // to a shared key reliably links them into one path.
  function strokeChains(segments) {
    var edgesForKey = {};
    var pointsByKey = {};

    function addPoint(p) {
      var k = pointKey(p);
      if (!pointsByKey[k]) pointsByKey[k] = p;
      return k;
    }

    for (var i = 0; i < segments.length; i++) {
      var ka = addPoint(segments[i][0]);
      var kb = addPoint(segments[i][1]);
      (edgesForKey[ka] = edgesForKey[ka] || []).push(kb);
      (edgesForKey[kb] = edgesForKey[kb] || []).push(ka);
    }

    var visited = {};
    function edgeId(k1, k2) {
      return k1 < k2 ? k1 + "|" + k2 : k2 + "|" + k1;
    }

    function walk(startKey) {
      var chain = [pointsByKey[startKey]];
      var currentKey = startKey;
      while (true) {
        var neighbors = edgesForKey[currentKey] || [];
        var nextKey = null;
        for (var ni = 0; ni < neighbors.length; ni++) {
          var eid = edgeId(currentKey, neighbors[ni]);
          if (!visited[eid]) {
            nextKey = neighbors[ni];
            break;
          }
        }
        if (nextKey === null) break;
        visited[edgeId(currentKey, nextKey)] = true;
        chain.push(pointsByKey[nextKey]);
        currentKey = nextKey;
        if (currentKey === startKey) break; // closed loop
      }
      return chain;
    }

    ctx.beginPath();
    var k;
    // Open chains first: any point with exactly one connection is an end.
    for (k in edgesForKey) {
      if (edgesForKey[k].length === 1) strokeChain(walk(k));
    }
    // Whatever's left over is closed loops with no natural start point.
    for (k in edgesForKey) {
      var neighbors = edgesForKey[k];
      for (var ni = 0; ni < neighbors.length; ni++) {
        if (!visited[edgeId(k, neighbors[ni])]) strokeChain(walk(k));
      }
    }
    ctx.stroke();
  }

  // Quadratic-smoothed polyline: curve through the midpoint of each
  // consecutive pair, using the shared point as control -- the standard
  // cheap trick for turning a connect-the-dots path into a soft curve
  // without full spline math.
  // Catmull-Rom, not midpoint-quadratic: the earlier version curved *toward*
  // each crossing point without ever reaching it (except chain endpoints),
  // which is exactly why the line drifted from the fill after smoothing --
  // the fill still bands on the true, unsmoothed crossing positions. A
  // Catmull-Rom segment passes through every real point exactly and only
  // uses neighbors to shape the tangent between them, so line and fill stay
  // tied to the same positions with no possible corner-cutting drift.
  function strokeChain(points) {
    var n = points.length;
    if (n < 2) return;
    ctx.moveTo(points[0][0], points[0][1]);
    if (n === 2) {
      ctx.lineTo(points[1][0], points[1][1]);
      return;
    }
    for (var i = 0; i < n - 1; i++) {
      var p0 = points[i - 1] || points[i];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6;
      var c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6;
      var c2y = p2[1] - (p3[1] - p1[1]) / 6;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, p2[0], p2[1]);
    }
  }

  function drawContours() {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (var li = 0; li < LEVELS.length; li++) {
      var threshold = LEVELS[li];
      var isZero = threshold === 0;
      // Rank-based, not value-based: the noise field's realized range
      // rarely spans the full [-0.5, 0.5] of LEVELS (it's a weighted sum
      // of two octaves, which clusters near the middle), so mapping color
      // to the raw threshold left the reddest bands almost never drawn.
      // Index position guarantees the full ink -> accent gradient shows
      // up across whatever levels actually render. Same ramp as the fill.
      var c = levelColor(li, LEVELS.length);
      // Flat alpha across all non-zero bands: a depth-based falloff would
      // dim the outer (most colorful) bands the most, directly undoing
      // the color ramp. Color carries the elevation cue here, not brightness.
      var alpha = (isZero ? 0.85 : 0.68) * LINE_INTENSITY;
      ctx.strokeStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha + ")";
      // the zero level stays a hair bolder, like a coastline on a real
      // topo map -- a reference line, not just another band.
      ctx.lineWidth = isZero ? 1.8 : 1.4;

      strokeChains(collectSegments(threshold));
    }
  }

  function render(driftX, driftY, warpX, warpY) {
    ctx.clearRect(0, 0, width, height);
    sampleGrid(driftX, driftY, warpX, warpY);
    if (FILL_ENABLED) drawFill();
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
