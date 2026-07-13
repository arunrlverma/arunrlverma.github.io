/* Suminagashi fluid — a real GPU fluid simulation (Stam stable-fluids: advect → curl →
   vorticity → divergence → Jacobi pressure → gradient-subtract → dye), confined to the hero.
   Ink is SUBTRACTIVE: the dye field stores Beer–Lambert absorption and the display shader
   paints PAPER · exp(−absorption), so ink darkens the washi like real sumi rather than glowing.
   Hold/drag on the hero to flow ink; pick a color from the swatches; when idle it keeps
   dropping ink so the water is always moving. Pauses (Page Visibility) when the tab is hidden.
   Reduced-motion → a static settled composition.
   Modelled on the reference (suminagashi-fjdbyyqi.manus.space); WebGL2, no dependencies. */
(function () {
  if (!document.body || !document.body.classList.contains("sumi")) return;  // any suminagashi page
  const hero = document.querySelector(".timeline-hero");
  if (!hero) return;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || window.innerWidth < 880;
  const staticMode = reduceMotion || mobile;

  const canvas = document.createElement("canvas");
  canvas.className = "sumi-fluid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false });
  if (!gl) return;                                  // no WebGL2 → hero stays clean paper (graceful)
  const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) return;                                 // can't render to float → bail gracefully
  gl.getExtension("OES_texture_float_linear");

  document.body.classList.add("has-fluid");
  hero.prepend(canvas);

  // ---- palette (display colors → absorption) + paper ----
  const INKS = {
    sumi:    [0xbd / 255, 0xbc / 255, 0xc8 / 255],   // pastel grey-lilac
    ai:      [0x88 / 255, 0xb0 / 255, 0xdb / 255],   // pastel indigo-blue
    shu:     [0xe8 / 255, 0x9e / 255, 0x92 / 255],   // pastel coral
    matsuba: [0xa4 / 255, 0xcf / 255, 0xb4 / 255],   // pastel sage
  };
  const INK_KEYS = Object.keys(INKS);
  const PAPER = [1, 1, 1];   // white page ground
  const ABS_E = 0.012;
  function inkAbsorption(rgb, strength) {
    return [
      -Math.log(Math.max(rgb[0], ABS_E)) * strength,
      -Math.log(Math.max(rgb[1], ABS_E)) * strength,
      -Math.log(Math.max(rgb[2], ABS_E)) * strength,
    ];
  }
  let inkMode = "cycle", inkCycleIdx = 0;
  function currentInk(advance) {
    if (inkMode === "cycle") {
      const c = INKS[INK_KEYS[inkCycleIdx % INK_KEYS.length]];
      if (advance) inkCycleIdx++;
      return c;
    }
    return INKS[inkMode] || INKS.sumi;
  }

  const config = {
    SIM_RES: mobile ? 128 : 256,
    DYE_RES: mobile ? 640 : 1024,
    PRESSURE_ITER: mobile ? 20 : 28,
    PRESSURE_DECAY: 0.8,
    VEL_DISSIPATION: 0.16,
    DYE_DISSIPATION: 0.07,
    CURL: 14,
    SPLAT_RADIUS: 0.0026,
    SPLAT_FORCE: 5200,
  };

  // ---- shader plumbing ----
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); }
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); }
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p, u };
  }

  const VERT = `#version 300 es
  precision highp float;
  in vec2 aPos; out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB;
  uniform vec2 uTexel;
  void main(){
    vUv = aPos * 0.5 + 0.5;
    vL = vUv - vec2(uTexel.x, 0.0); vR = vUv + vec2(uTexel.x, 0.0);
    vT = vUv + vec2(0.0, uTexel.y); vB = vUv - vec2(0.0, uTexel.y);
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;
  const F = (body) => `#version 300 es
  precision highp float; precision highp sampler2D;
  in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB; out vec4 fragColor;
  ${body}`;

  const advectP = program(VERT, F(`
    uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 uTexel;
    uniform float uDt; uniform float uDissipation;
    void main(){
      vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
      fragColor = texture(uSource, coord) / (1.0 + uDissipation * uDt);
    }`));
  const divP = program(VERT, F(`
    uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).x; float R = texture(uVelocity, vR).x;
      float T = texture(uVelocity, vT).y; float B = texture(uVelocity, vB).y;
      fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`));
  const curlP = program(VERT, F(`
    uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).y; float R = texture(uVelocity, vR).y;
      float T = texture(uVelocity, vT).x; float B = texture(uVelocity, vB).x;
      fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`));
  const vortP = program(VERT, F(`
    uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float uCurlStrength; uniform float uDt;
    void main(){
      float L = texture(uCurl, vL).x; float R = texture(uCurl, vR).x;
      float T = texture(uCurl, vT).x; float B = texture(uCurl, vB).x;
      float C = texture(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= uCurlStrength * C; force.y *= -1.0;
      vec2 vel = texture(uVelocity, vUv).xy + force * uDt;
      fragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
    }`));
  const pressP = program(VERT, F(`
    uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main(){
      float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
      float div = texture(uDivergence, vUv).x;
      fragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
    }`));
  const gradP = program(VERT, F(`
    uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main(){
      float L = texture(uPressure, vL).x; float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x; float B = texture(uPressure, vB).x;
      vec2 vel = texture(uVelocity, vUv).xy - 0.5 * vec2(R - L, T - B);
      fragColor = vec4(vel, 0.0, 1.0);
    }`));
  const splatP = program(VERT, F(`
    uniform sampler2D uTarget; uniform float uAspect; uniform vec3 uColor; uniform vec2 uPoint; uniform float uRadius;
    void main(){
      vec2 p = vUv - uPoint; p.x *= uAspect;
      vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
      fragColor = vec4(texture(uTarget, vUv).xyz + splat, 1.0);
    }`));
  const clearP = program(VERT, F(`
    uniform sampler2D uTexture; uniform float uValue;
    void main(){ fragColor = uValue * texture(uTexture, vUv); }`));
  // display outputs TRANSMITTANCE (exp(-absorption)); the canvas is composited over the page
  // with CSS mix-blend-mode:multiply, so white = no change and ink darkens the washi beneath.
  const dispP = program(VERT, F(`
    uniform sampler2D uDye;
    void main(){ fragColor = vec4(exp(-texture(uDye, vUv).rgb), 1.0); }`));

  // fullscreen triangle
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // ---- framebuffers ----
  function makeFBO(w, h, internal, format, type, filter) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h, texel: [1 / w, 1 / h] };
  }
  function makeDouble(w, h, internal, format, type, filter) {
    let a = makeFBO(w, h, internal, format, type, filter);
    let b = makeFBO(w, h, internal, format, type, filter);
    return {
      get read() { return a; }, get write() { return b; },
      swap() { const t = a; a = b; b = t; },
      w, h, texel: [1 / w, 1 / h],
    };
  }

  let velocity, dye, divergence, curl, pressure, simRes, dyeRes;
  function initFBOs() {
    const lin = gl.LINEAR, near = gl.NEAREST;
    simRes = resolution(config.SIM_RES);
    dyeRes = resolution(config.DYE_RES);
    velocity = makeDouble(simRes.w, simRes.h, gl.RG16F, gl.RG, gl.HALF_FLOAT, lin);
    dye = makeDouble(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, lin);
    divergence = makeFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT, near);
    curl = makeFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT, near);
    pressure = makeDouble(simRes.w, simRes.h, gl.R16F, gl.RED, gl.HALF_FLOAT, near);
  }
  function resolution(res) {
    const aspect = canvas.width / canvas.height || 1;
    const min = Math.round(res), max = Math.round(res * aspect);
    return aspect >= 1 ? { w: max, h: min } : { w: min, h: Math.round(res / aspect) };
  }

  function blit(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
    gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function use(prog, texel) {
    gl.useProgram(prog.p);
    if (prog.u.uTexel) gl.uniform2f(prog.u.uTexel, texel[0], texel[1]);
  }
  function bindTex(loc, tex, unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit); }

  // ---- splats ----
  function splatVelocity(x, y, fx, fy, radiusMul) {
    use(splatP, velocity.texel);
    bindTex(splatP.u.uTarget, velocity.read.tex, 0);
    gl.uniform1f(splatP.u.uAspect, canvas.width / canvas.height);
    gl.uniform2f(splatP.u.uPoint, x, y);
    gl.uniform1f(splatP.u.uRadius, config.SPLAT_RADIUS * (radiusMul || 1));
    gl.uniform3f(splatP.u.uColor, fx, fy, 0);
    blit(velocity.write); velocity.swap();
  }
  function splatDye(x, y, absorption, radiusMul) {
    use(splatP, dye.texel);
    bindTex(splatP.u.uTarget, dye.read.tex, 0);
    gl.uniform1f(splatP.u.uAspect, canvas.width / canvas.height);
    gl.uniform2f(splatP.u.uPoint, x, y);
    gl.uniform1f(splatP.u.uRadius, config.SPLAT_RADIUS * (radiusMul || 1));
    gl.uniform3f(splatP.u.uColor, absorption[0], absorption[1], absorption[2]);
    blit(dye.write); dye.swap();
  }
  // a drop = ink + a little outward velocity so it blooms and flows
  function drop(x, y, rgb, strength, force) {
    splatDye(x, y, inkAbsorption(rgb, strength), 2.0);
    const a = Math.random() * Math.PI * 2;
    splatVelocity(x, y, Math.cos(a) * force, Math.sin(a) * force, 1.4);
  }

  // ---- step ----
  function step(dt) {
    gl.disable(gl.BLEND);
    use(curlP, velocity.texel); bindTex(curlP.u.uVelocity, velocity.read.tex, 0); blit(curl);
    use(vortP, velocity.texel);
    bindTex(vortP.u.uVelocity, velocity.read.tex, 0); bindTex(vortP.u.uCurl, curl.tex, 1);
    gl.uniform1f(vortP.u.uCurlStrength, config.CURL); gl.uniform1f(vortP.u.uDt, dt);
    blit(velocity.write); velocity.swap();
    use(divP, velocity.texel); bindTex(divP.u.uVelocity, velocity.read.tex, 0); blit(divergence);
    use(clearP, pressure.texel); bindTex(clearP.u.uTexture, pressure.read.tex, 0);
    gl.uniform1f(clearP.u.uValue, config.PRESSURE_DECAY); blit(pressure.write); pressure.swap();
    use(pressP, pressure.texel);
    for (let i = 0; i < config.PRESSURE_ITER; i++) {
      bindTex(pressP.u.uPressure, pressure.read.tex, 0); bindTex(pressP.u.uDivergence, divergence.tex, 1);
      blit(pressure.write); pressure.swap();
    }
    use(gradP, velocity.texel);
    bindTex(gradP.u.uPressure, pressure.read.tex, 0); bindTex(gradP.u.uVelocity, velocity.read.tex, 1);
    blit(velocity.write); velocity.swap();
    use(advectP, velocity.texel);
    bindTex(advectP.u.uVelocity, velocity.read.tex, 0); bindTex(advectP.u.uSource, velocity.read.tex, 1);
    gl.uniform1f(advectP.u.uDt, dt); gl.uniform1f(advectP.u.uDissipation, config.VEL_DISSIPATION);
    blit(velocity.write); velocity.swap();
    bindTex(advectP.u.uVelocity, velocity.read.tex, 0); bindTex(advectP.u.uSource, dye.read.tex, 1);
    gl.uniform1f(advectP.u.uDissipation, config.DYE_DISSIPATION);
    blit(dye.write); dye.swap();
  }
  function render() {
    use(dispP, dye.texel);
    bindTex(dispP.u.uDye, dye.read.tex, 0);
    blit(null);
  }

  // ---- sizing ----
  let dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
  function resize() {
    const rect = hero.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width === w && canvas.height === h && velocity) return;
    canvas.width = w; canvas.height = h;
    initFBOs();
  }

  // ---- interaction ----
  const pointer = { down: false, x: 0, y: 0 };
  let lastInteraction = 0, color = currentInk(false), primed = false;
  function norm(e) {
    const rect = hero.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, 1 - ((e.clientY - rect.top) / rect.height)))
    };
  }
  function onDown(e) {
    if (e.target.closest("button, a, input, textarea, select")) return;  // don't hijack controls/links
    const n = norm(e);
    pointer.down = true; pointer.x = n.x; pointer.y = n.y;
    color = currentInk(true);
    drop(n.x, n.y, color, 0.6 + Math.random() * 0.3, 900);
    lastInteraction = now();
  }
  function onMove(e) {
    const n = norm(e);
    if (!primed) { pointer.x = n.x; pointer.y = n.y; primed = true; return; }
    if (e.buttons === 0) pointer.down = false;
    const px = pointer.x, py = pointer.y;
    pointer.x = n.x; pointer.y = n.y;
    const dx = n.x - px, dy = n.y - py, speed = Math.hypot(dx, dy);
    if (speed < 1e-4) return;
    lastInteraction = now();
    if (pointer.down) {                              // press + drag → push flow AND lay ink
      splatVelocity(n.x, n.y, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 2.0);
      splatDye(n.x, n.y, inkAbsorption(color, Math.min(0.06 + speed * 0.12, 0.9)), 1.4);
    } else {                                         // plain hover → just stir the water (no click)
      splatVelocity(n.x, n.y, dx * config.SPLAT_FORCE * 0.7, dy * config.SPLAT_FORCE * 0.7, 1.2);
    }
  }
  function onUp() { pointer.down = false; }
  function now() { return (window.performance && performance.now) ? performance.now() : 0; }

  // color swatches
  document.querySelectorAll("[data-ink]").forEach((btn) => {
    btn.addEventListener("click", () => {
      inkMode = btn.dataset.ink;
      document.querySelectorAll("[data-ink]").forEach((b) => b.classList.toggle("active", b === btn));
    });
  });

  // ---- run loop ----
  let last = 0, nextDrop = 1400, running = false, rafId = 0, staticSteps = 0;
  function seed() {
    const spots = [[0.28, 0.66, INKS.ai], [0.62, 0.52, INKS.shu], [0.5, 0.3, INKS.matsuba], [0.18, 0.26, INKS.sumi]];
    spots.forEach(([x, y, c]) => drop(x, y, c, 0.7, 700));
  }
  function frame(t) {
    if (!running) return;
    const dt = last ? Math.min((t - last) / 1000, 0.0166) : 0.0166;
    last = t;
    if (staticMode) {
      step(dt); render(); staticSteps++;
      if (staticSteps < 84) rafId = requestAnimationFrame(frame); else running = false;
      return;
    }
    // idle auto-drops so the water is always moving
    nextDrop -= dt * 1000;
    if (now() - lastInteraction > 2500 && nextDrop <= 0) {
      const x = 0.12 + Math.random() * 0.76, y = 0.16 + Math.random() * 0.66;
      const c = inkMode === "cycle" ? INKS[INK_KEYS[Math.floor(Math.random() * INK_KEYS.length)]] : (INKS[inkMode] || INKS.sumi);
      drop(x, y, c, 0.5 + Math.random() * 0.25, 600);
      nextDrop = 1100 + Math.random() * 1600;
    }
    step(dt); render();
    rafId = requestAnimationFrame(frame);
  }
  function startLoop() { if (running) return; running = true; last = 0; rafId = requestAnimationFrame(frame); }
  function stopLoop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

  resize();
  seed();
  if (staticMode) {
    startLoop();                                    // settle once, then freeze on touch/reduced motion
    let rt; window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        resize();
        seed();
        staticSteps = 0;
        startLoop();
      }, 200);
    }, { passive: true });
  } else {
    hero.addEventListener("pointerdown", onDown, { passive: true });
    hero.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onUp);

    let heroInView = true;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden || !heroInView) stopLoop();
      else { lastInteraction = now(); startLoop(); }
    });

    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        heroInView = entries[0]?.isIntersecting ?? true;
        if (heroInView && !document.hidden) startLoop();
        else stopLoop();
      }, { threshold: 0.02 });
      heroObserver.observe(hero);
    } else {
      startLoop();
    }

    let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 200); }, { passive: true });
  }
})();
