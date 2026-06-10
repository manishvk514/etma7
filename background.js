/* ==========================================================================
   EVERYTHING MEDIA — painted ink background (Three.js)
   A fullscreen domain-warped fbm "wet paint" field.
   - Colors bleed between chapter palettes as you scroll.
   - The cursor stirs the paint like a brush in water.
   Exposes window.EM_BG = { setProgress(p) } for main.js.
   ========================================================================== */

(function () {
  "use strict";

  var canvas = document.getElementById("paint");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Graceful fallback — keep the CSS background if WebGL/Three is unavailable.
  if (!window.THREE || !window.WebGLRenderingContext) {
    canvas.style.display = "none";
    window.EM_BG = { setProgress: function () {} };
    return;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      powerPreference: "high-performance"
    });
  } catch (e) {
    canvas.style.display = "none";
    window.EM_BG = { setProgress: function () {} };
    return;
  }

  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ----- chapter palettes: [deep base, paint mid, accent glow] ----- */
  var PALETTES = [
    ["#07070c", "#15151f", "#f2ede4"], // 0 prologue — ink & projector white
    ["#1c0a08", "#5c1a12", "#d9a441"], // 1 craft — lacquer red & old gold
    ["#06181b", "#0e3a40", "#8fe0d6"], // 2 machine — petrol & signal teal
    ["#120d24", "#2c1e55", "#b79cff"], // 3 work — indigo & violet
    ["#1e1208", "#4a2e14", "#e8b96b"], // 4 studio — amber dusk
    ["#08080d", "#14121c", "#f2ede4"]  // 5 credits — back to ink
  ].map(function (p) {
    return p.map(function (hex) { return new THREE.Color(hex); });
  });

  var uniforms = {
    uTime:    { value: 0 },
    uRes:     { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
    uStir:    { value: 0 }, // mouse energy 0..1
    uDeep:    { value: PALETTES[0][0].clone() },
    uMid:     { value: PALETTES[0][1].clone() },
    uGlow:    { value: PALETTES[0][2].clone() }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: [
      "void main() {",
      "  gl_Position = vec4(position, 1.0);",
      "}"
    ].join("\n"),
    fragmentShader: [
      "precision highp float;",
      "uniform float uTime;",
      "uniform vec2  uRes;",
      "uniform vec2  uMouse;",
      "uniform float uStir;",
      "uniform vec3  uDeep;",
      "uniform vec3  uMid;",
      "uniform vec3  uGlow;",

      /* hash + value noise */
      "float hash(vec2 p) {",
      "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);",
      "}",
      "float noise(vec2 p) {",
      "  vec2 i = floor(p); vec2 f = fract(p);",
      "  vec2 u = f * f * (3.0 - 2.0 * f);",
      "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
      "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
      "}",
      "float fbm(vec2 p) {",
      "  float v = 0.0; float a = 0.5;",
      "  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);",
      "  for (int i = 0; i < 5; i++) {",
      "    v += a * noise(p);",
      "    p = rot * p * 2.05;",
      "    a *= 0.5;",
      "  }",
      "  return v;",
      "}",

      "void main() {",
      "  vec2 uv = gl_FragCoord.xy / uRes;",
      "  vec2 p = uv;",
      "  p.x *= uRes.x / uRes.y;",

      "  float t = uTime * 0.045;",

      /* cursor stir — radial swirl around the mouse */
      "  vec2 m = uMouse;",
      "  m.x *= uRes.x / uRes.y;",
      "  vec2 toM = p - m;",
      "  float dM = length(toM);",
      "  float influence = exp(-dM * 3.2) * (0.35 + uStir * 1.4);",
      "  float ang = influence * 2.4;",
      "  mat2 swirl = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));",
      "  vec2 q = m + swirl * toM;",

      /* domain-warped paint field */
      "  vec2 w1 = vec2(fbm(q * 1.6 + t), fbm(q * 1.6 - t * 0.7 + 4.2));",
      "  vec2 w2 = vec2(fbm(q * 2.2 + 2.4 * w1 + t * 0.5),",
      "                 fbm(q * 2.2 + 2.4 * w1 - t * 0.3 + 8.9));",
      "  float paint = fbm(q * 1.4 + 2.6 * w2);",

      /* layered color: deep canvas -> paint body -> glow veins */
      "  vec3 col = mix(uDeep, uMid, smoothstep(0.28, 0.78, paint));",
      "  float vein = smoothstep(0.62, 0.92, fbm(q * 2.8 + w2 * 3.0 + t));",
      "  col = mix(col, uGlow, vein * 0.22);",

      /* cursor leaves a faint luminous wake */
      "  col += uGlow * influence * 0.10;",

      /* vignette to keep type readable */
      "  float vig = smoothstep(1.25, 0.35, distance(uv, vec2(0.5)));",
      "  col *= mix(0.72, 1.0, vig);",

      "  gl_FragColor = vec4(col, 1.0);",
      "}"
    ].join("\n")
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  /* ----- scroll progress -> palette bleed ----- */
  var progress = 0;
  var deepT = new THREE.Color(), midT = new THREE.Color(), glowT = new THREE.Color();

  function paletteAt(p) {
    var segs = PALETTES.length - 1;
    var f = Math.min(Math.max(p, 0), 1) * segs;
    var i = Math.min(Math.floor(f), segs - 1);
    var k = f - i;
    deepT.copy(PALETTES[i][0]).lerp(PALETTES[i + 1][0], k);
    midT.copy(PALETTES[i][1]).lerp(PALETTES[i + 1][1], k);
    glowT.copy(PALETTES[i][2]).lerp(PALETTES[i + 1][2], k);
  }

  window.EM_BG = {
    setProgress: function (p) { progress = p; }
  };

  /* ----- mouse (smoothed) ----- */
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, vel: 0 };

  window.addEventListener("pointermove", function (e) {
    var nx = e.clientX / window.innerWidth;
    var ny = 1.0 - e.clientY / window.innerHeight;
    mouse.vel = Math.min(1, mouse.vel + Math.hypot(nx - mouse.tx, ny - mouse.ty) * 14);
    mouse.tx = nx;
    mouse.ty = ny;
  }, { passive: true });

  /* ----- resize ----- */
  window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
  });

  /* ----- render loop ----- */
  var clock = new THREE.Clock();

  function frame() {
    requestAnimationFrame(frame);

    var dt = clock.getDelta();
    uniforms.uTime.value += reduceMotion ? dt * 0.15 : dt;

    // ease mouse + decay stir energy
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    mouse.vel *= 0.94;
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uStir.value += ((reduceMotion ? 0 : mouse.vel) - uniforms.uStir.value) * 0.08;

    // bleed palettes toward scroll target
    paletteAt(progress);
    uniforms.uDeep.value.lerp(deepT, 0.05);
    uniforms.uMid.value.lerp(midT, 0.05);
    uniforms.uGlow.value.lerp(glowT, 0.05);

    renderer.render(scene, camera);
  }
  frame();
})();
