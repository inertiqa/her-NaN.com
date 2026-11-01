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
    transparent: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    resizeTo: window
  });

  window.app = app; //global scope

  // fragment
  const fsSource = `
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_real_time;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv - 0.25;
    p.x *= aspect;

    float currentY = p.y / 0.1;
    float fadeLength = 1.2;

    // --- wave0 ---
    float freq1 = 3.0;
    float amp1 = 0.66;
    float time1 = u_time * 0.33;
    float wave1 = sin(p.x * freq1 - time1) * amp1;
    wave1 += sin(p.x * (freq1 * 1.5) + time1 * 0.9) * (amp1 * 0.3);

    float fillArea1 = smoothstep(wave1 + 0.02, wave1 - 0.02, currentY);
    float fillFade1 = smoothstep(wave1 - fadeLength, wave1, currentY);
    float fillAlpha1 = fillArea1 * fillFade1 * 0.85;

    // --- wave1 ---
    float freq2 = 3.0;
    float amp2 = 0.66;
    float time2 = u_time * 0.33;
    float wave2 = sin(p.x * freq2 - time2) * amp2;
    wave2 += cos(p.x * (freq2 * 1.5) + time2 * 0.9) * (amp2 * 0.3);

    float fillArea2 = smoothstep(wave2 + 0.02, wave2 - 0.02, currentY);
    float fillFade2 = smoothstep(wave2 - (fadeLength * 1.3), wave2, currentY);
    float fillAlpha2 = fillArea2 * fillFade2 * 0.65;

    // --- mesh gradient ---
    float mesh1 = sin(uv.x * 3.0 + u_real_time * 0.1) * cos(uv.y * 2.5 + u_real_time * 0.2);
    float mesh2 = cos(uv.x * 2.0 - u_real_time * 0.3) * sin(uv.y * 3.5 - u_real_time * 0.1);
    float mesh3 = sin(uv.x * 4.0 - u_real_time * 0.2) * sin(uv.y * 2.0 + u_real_time * 0.3);

    mesh1 = smoothstep(-1.0, 1.0, mesh1);
    mesh2 = smoothstep(-1.0, 1.0, mesh2);
    mesh3 = smoothstep(-1.0, 1.0, mesh3);

    vec3 bgBase     = vec3(0.776, 0.8, 0.824);
    vec3 colorMesh1 = vec3(0.647, 0.678, 0.725);
    vec3 colorMesh2 = vec3(0.749, 0.78, 0.808);
    vec3 colorMesh3 = vec3(0.663, 0.69, 0.737);

    vec3 bgColor = mix(bgBase, colorMesh1, mesh1 + 0.8);
    bgColor = mix(bgColor, colorMesh2, mesh2 * 0.8);

    vec3 waveColor1 = vec3(0.81, 0.82, 0.83);
    vec3 waveColor2 = vec3(0.83, 0.82, 0.81);

    vec3 finalColor = bgColor;
    finalColor = mix(finalColor, waveColor2, fillAlpha2);
    finalColor = mix(finalColor, waveColor1, fillAlpha1);

    gl_FragColor = vec4(finalColor, 1.0);
  }
  `;

  // filters and container
  const uniforms = {
    u_resolution: [app.renderer.width, app.renderer.height],
    u_time: 0.0,
    u_real_time: 0.0
  };

  const waveFilter = new PIXI.Filter(undefined, fsSource, uniforms);

  const backgroundSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  backgroundSprite.width = app.screen.width;
  backgroundSprite.height = app.screen.height;
  backgroundSprite.filters = [waveFilter];

  app.stage.addChild(backgroundSprite);

  // render loop
  let mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
  let currentSpeed = 1.0;
  let targetSpeed = 1.0;
  let accumulatedTime = 0.0;
  let lastTimestamp = performance.now();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('resize', () => {
    backgroundSprite.width = app.screen.width;
    backgroundSprite.height = app.screen.height;
    waveFilter.uniforms.u_resolution = [app.renderer.width, app.renderer.height];
  });

  app.ticker.add(() => {
    const now = performance.now();
    const dt = (now - lastTimestamp) * 0.001;
    lastTimestamp = now;

    const dx = mouse.x - mouse.prevX;
    const dy = mouse.y - mouse.prevY;
    const distTraveled = Math.sqrt(dx * dx + dy * dy);

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;

    const mouseSpeed = distTraveled * 0.15;
    targetSpeed = 1.2 + mouseSpeed;

    currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    accumulatedTime += dt * currentSpeed;

    waveFilter.uniforms.u_resolution = [app.renderer.width, app.renderer.height];
    waveFilter.uniforms.u_time = accumulatedTime;
    waveFilter.uniforms.u_real_time = now * 0.001;
  });
});
