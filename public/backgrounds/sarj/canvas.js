/* global sarjBackgroundRenderer */
(() => {
  let engine;
  let animation;
  let profiles;
  let animatedObjects = [];
  let enabled = false;
  let lost = false;
  let initialized = false;
  let position = 0;
  let assetsFailed = false;
  let disposed = false;
  let frame;
  let openingForm;
  let openingSource;
  let openingMaterial;
  let openingColor;
  let openingSourcePosition;
  let openingFrame;
  let openingArtwork;
  let openingScroll = 0;
  let canvasBounds;
  let lastRenderTime = -Infinity;
  const openingSurface = { value: 1 };
  const sphereId = "56508b97-eb62-4850-aa45-901280e70082";
  const canvas = document.querySelector("canvas");
  const resources = new Set();
  const assetLoads = new Map();
  const assetController = new AbortController();
  const announce = (type) => window.parent.postMessage({ type }, window.location.origin);

  // The isolated renderer receives the site's CSS colors from its iframe URL.
  const parameters = new URLSearchParams(window.location.search);
  const direction = parameters.get("direction") === "rtl" ? -1 : 1;
  const theme = {};
  for (const token of ["background", "foreground", "primary", "primary-hover"]) {
    const color = parameters.get(token);
    if (color && /^#[\da-f]{6}$/i.test(color)) {
      document.documentElement.style.setProperty(`--${token}`, color);
    }
    theme[token] = getComputedStyle(document.documentElement)
      .getPropertyValue(`--${token}`).trim();
  }

  function themeScene(scene) {
    const { pwObjects, pwMaterials } = scene.engineState;
    for (const object of Object.values(pwObjects)) {
      if (object.type === "SCENE") {
        object.background = theme.background;
        object.fog.color = theme.background;
        object.ambientLight.color = theme.foreground;
        object.ambientLight.intensity = 0.075;
      } else if (object.type === "LIGHT") {
        object.color = theme.primary;
      }
    }

    // A soft front light gives the filled opening form a readable curved face.
    const light = Object.values(pwObjects).find((object) => object.type === "LIGHT");
    const fillId = "sarj-opening-fill";
    pwObjects[fillId] = {
      ...light, uuid: fillId, name: "Opening fill", color: theme["primary-hover"],
      position: { x: -3, y: 4, z: 6 }, intensity: 0.5,
    };
    scene.engineState.parents[fillId] = scene.engineState.sceneObjectId;
    scene.engineState.children[scene.engineState.sceneObjectId].push(fillId);
    const effects = scene.engineState.effects;
    // Keep a little atmospheric texture without obscuring the curved shading.
    effects.NOISE.opacity = 0.035;
    effects.BLOOM.intensity = 0.25;
    // The soft mobile artwork does not need two anti-aliasing passes.
    if (innerWidth < 768) effects.SMAA.enabled = false;
    const glass = Object.values(effects)
      .find((effect) => effect.type === "CUSTOM_EFFECT");
    if (glass) {
      glass.uniforms.uRefraction.value = -0.014;
      // Chroma is zero in this scene: sample once instead of three times.
      glass.fragmentShader = glass.fragmentShader.replace(
        "col.r = texture2D(uPreviousFrame, finalUV + vec2(chromaAmt, 0.0)).r;\n    col.g = texture2D(uPreviousFrame, finalUV).g;\n    col.b = texture2D(uPreviousFrame, finalUV - vec2(chromaAmt, 0.0)).b;",
        "col = texture2D(uPreviousFrame, finalUV).rgb;",
      );
      if (direction < 0) {
        glass.uniforms.uMarginLeft.value = 0.5;
        glass.uniforms.uMarginRight.value = 0;
      }
    }
    for (const material of Object.values(pwMaterials)) {
      material.color = material.overrideObjectId ? theme.primary : theme.foreground;
      material.sheenColor = theme.primary;
      material.specularColor = theme["primary-hover"];
      material.attenuationColor = theme.foreground;
      material.emissive = theme.primary;
    }

    // Keep animated color keyframes aligned with the site palette.
    const colorProperties = new Set([
      "color", "background", "emissive", "sheenColor", "specularColor", "attenuationColor",
    ]);
    for (const sheet of Object.values(scene.animations.sheetsById)) {
      for (const [id, tracks] of Object.entries(sheet.sequence.tracksByObject)) {
        const object = pwMaterials[id] || pwObjects[id];
        if (!object) continue;
        for (const [path, trackId] of Object.entries(tracks.trackIdByPropPath || {})) {
          const properties = JSON.parse(path);
          if (properties.length !== 1 || !colorProperties.has(properties[0])) continue;
          const color = object[properties[0]];
          if (!color) continue;
          const rgb = [1, 3, 5].map((offset) => parseInt(color.slice(offset, offset + 2), 16) / 255);
          for (const keyframe of Object.values(tracks.trackData[trackId].keyframes.byId)) {
            keyframe.value = { r: rgb[0], g: rgb[1], b: rgb[2], a: keyframe.value.a ?? 1 };
          }
        }
      }
    }
  }

  function connectFormations(scene) {
    // Overlap the exposed scene swaps and remove the idle keys between
    // formations, so scrolling always advances a visible transformation.
    const handoffs = {
      "Coin Group One": [[0.138, null], [0.142, 0.145]],
      "Coin Group Two": [[0.142, 0.075], [0.144, 0.105], [0.369, 0.38], [0.426, 0.46]],
      "Coin Group Three": [[0.3917910447761194, 0.34], [0.458955223880597, 0.42]],
      "Coin": [[0.21012658227848102, 0.105]],
    };
    for (const sheet of Object.values(scene.animations.sheetsById)) {
      for (const [id, tracks] of Object.entries(sheet.sequence.tracksByObject)) {
        const handoff = handoffs[scene.engineState.pwObjects[id]?.name];
        if (!handoff) continue;
        for (const track of Object.values(tracks.trackData)) {
          for (const [key, keyframe] of Object.entries(track.keyframes.byId)) {
            const stop = handoff.find(([position]) => Math.abs(position - keyframe.position) < 1e-6);
            if (!stop) continue;
            if (stop[1] === null) {
              delete track.keyframes.byId[key];
              delete track.keyframes.allIds[key];
            } else keyframe.position = stop[1];
          }
        }
      }
    }
  }

  // Cache assets for the background resource loader.
  async function loadAsset(url) {
    try {
      const response = await fetch(url, { signal: assetController.signal });
      if (!response.ok) throw new Error(`Background asset: ${response.status}`);
      if (disposed) throw new Error("Background disposed");
      const resource = URL.createObjectURL(await response.blob());
      if (disposed) {
        URL.revokeObjectURL(resource);
        throw new Error("Background disposed");
      }
      resources.add(resource);
      return resource;
    } catch (error) {
      assetsFailed = true;
      if (!disposed) announce("sarj-background-unavailable");
      throw error;
    }
  }
  window._pwLoadFileFromCache = (url) => {
    const source = new URL(url, location.href).href;
    if (!assetLoads.has(source)) assetLoads.set(source, loadAsset(source));
    return assetLoads.get(source);
  };

  function sequencePosition(progress) {
    if (progress <= 0) return 0;
    const device = innerWidth < 768 ? "mobile" : innerWidth < 992 ? "tablet" : "desktop";
    const profile = profiles[device];
    // Map the complete authored path from its opening anchor to its last.
    // A viewport offset here skips the opening frames on the first scroll.
    const position = progress * profile.height;
    const anchors = profile.anchors;
    for (let i = 1; i < anchors.length; i++) {
      if (position <= anchors[i].position) {
        const a = anchors[i - 1];
        const b = anchors[i];
        const ratio = (position - a.position) / (b.position - a.position);
        return a.percentage + ratio * (b.percentage - a.percentage);
      }
    }
    return anchors[anchors.length - 1].percentage;
  }

  function measureCanvas() {
    canvasBounds = canvas.getBoundingClientRect();
    if (!engine || lost || disposed) return;
    const width = Math.max(1, canvasBounds.width);
    const height = Math.max(1, canvasBounds.height);
    const compact = innerWidth < 768;
    const ratio = Math.min(devicePixelRatio || 1, compact ? 1 : 1.25,
      Math.sqrt((compact ? 1.2e6 : 2.5e6) / (width * height)));
    if (engine.renderer.getPixelRatio() !== ratio) engine.renderer.setPixelRatio(ratio);
    engine.renderer.setSize(width, height, false);
  }

  function renderScene() {
    engine.core.render();
  }

  const smoothstep = (start, end, value) => {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };

  const smootherstep = (start, end, value) => {
    const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  async function createOpeningForm() {
    // Reuse the round mesh already inside the authored opening formation.
    // Its filled counterpart meets the target world pose before handing back.
    openingSource = engine.getObject(sphereId);
    openingSourcePosition = openingSource.position.clone();
    openingForm = openingSource.clone();
    openingForm.name = "SARJ opening sphere handoff";
    openingMaterial = openingSource.material.clone();
    openingMaterial.transparent = true;
    openingMaterial.opacity = 0;
    openingForm.visible = false;
    openingColor = openingMaterial.color.clone().set(theme.primary)
      .lerp(openingMaterial.color.clone().set(theme.background), 0.82);
    openingMaterial.color.copy(openingColor);
    openingMaterial.emissive.set(theme.primary);
    // Fine, continuous pores rotate with the form; they never become bands.
    openingMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.sarjSurfaceStrength = openingSurface;
      shader.uniforms.sarjRimColor = { value: openingColor.clone().set(theme.primary) };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 sarjSurfacePosition;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nsarjSurfacePosition = position;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>
          varying vec3 sarjSurfacePosition;
          uniform float sarjSurfaceStrength;
          uniform vec3 sarjRimColor;
          float sarjHash(vec3 p) {
            return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
          }
          float sarjNoise(vec3 p) {
            vec3 cell = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(sarjHash(cell), sarjHash(cell + vec3(1, 0, 0)), f.x),
                  mix(sarjHash(cell + vec3(0, 1, 0)), sarjHash(cell + vec3(1, 1, 0)), f.x), f.y),
              mix(mix(sarjHash(cell + vec3(0, 0, 1)), sarjHash(cell + vec3(1, 0, 1)), f.x),
                  mix(sarjHash(cell + vec3(0, 1, 1)), sarjHash(cell + vec3(1, 1, 1)), f.x), f.y), f.z);
          }
        `)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float sarjPore = sarjNoise(sarjSurfacePosition * 110.0);
          float sarjMottle = sarjNoise(sarjSurfacePosition * 9.0);
          diffuseColor.rgb *= 1.0 + ((sarjPore - 0.5) * 0.045 + (sarjMottle - 0.5) * 0.12) * sarjSurfaceStrength;
        `)
        .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
          roughnessFactor = clamp(roughnessFactor + (sarjPore - 0.5) * 0.08 * sarjSurfaceStrength, 0.05, 1.0);
        `)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          normal = normalize(normal + vec3(dFdx(sarjPore), dFdy(sarjPore), 0.0) * 0.07 * sarjSurfaceStrength);
        `)
        .replace("#include <opaque_fragment>", `
          // A broad unlit hemisphere makes the globe read as a dark planet.
          float sarjDaylight = dot(normal, normalize(vec3(-0.65, 0.55, 0.3)));
          float sarjShadow = mix(0.18, 1.0, smoothstep(-0.28, 0.52, sarjDaylight));
          outgoingLight *= mix(1.0, sarjShadow, sarjSurfaceStrength);
          float sarjRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.5);
          outgoingLight += sarjRimColor * sarjRim * 0.065 * mix(0.3, 1.0, sarjShadow) * sarjSurfaceStrength;
          #include <opaque_fragment>
        `);
    };
    openingMaterial.customProgramCacheKey = () => "sarj-opening-planet";
    openingForm.material = openingMaterial;
    engine.getActiveScene().add(openingForm);

    // React mounts the registry component here, using the same canvas pose.
    openingArtwork = document.createElement("div");
    openingArtwork.className = "opening-crystalized-ball";
    openingArtwork.setAttribute("aria-hidden", "true");
    // Share the ball's pose with a viewport-sized particle canvas.
    openingArtwork.openingLayout = {
      centerX: 0, centerY: 0, radius: 1, roll: 0, gather: 0, solidify: 0,
    };
    document.body.appendChild(openingArtwork);
    announce("sarj-background-opening");
    if (disposed) openingArtwork.remove();
  }

  function applyOpeningForm(next) {
    if (!openingForm) return;
    openingFrame = next;
    const scroll = Math.max(0, (next.scroll || 0) / innerHeight);
    const blend = smoothstep(0.7, 1.6, scroll);
    // About four 100px wheel steps reach 95%; finish the last 5% at hero exit.
    const formationEnd = Math.min(400, innerHeight * 0.55);
    const gather = smootherstep(0, formationEnd * 0.5, openingScroll);
    const solidify = smootherstep(formationEnd * 0.35, formationEnd, openingScroll);
    const settled = smootherstep(formationEnd, innerHeight, openingScroll);
    const opacity = 0.95 * solidify + 0.05 * settled;
    const particlePresence = (1 - 0.6 * solidify) * (1 - settled);
    openingArtwork.openingLayout.gather = gather;
    openingArtwork.openingLayout.solidify = solidify;
    const finish = smoothstep(1, 1.6, scroll);
    openingSource.visible = blend >= 0.999;
    openingForm.visible = opacity > 0.001 && blend < 0.999;
    openingArtwork.style.opacity = String(particlePresence);
    openingArtwork.style.visibility = particlePresence > 0.001 ? "visible" : "hidden";

    const camera = engine.getActiveCamera();
    const worldPosition = openingSource.position.clone();
    const worldScale = openingSource.scale.clone();
    const worldRotation = openingSource.quaternion.clone();
    const cameraPosition = camera.position.clone();
    // Restore the authored local pose before applying this frame's offset.
    openingSource.position.copy(openingSourcePosition);
    openingSource.updateWorldMatrix(true, false);
    openingSource.getWorldPosition(worldPosition);
    openingSource.getWorldScale(worldScale);
    openingSource.getWorldQuaternion(worldRotation);
    camera.getWorldPosition(cameraPosition);

    const front = 3;
    const depth = Math.max(1, cameraPosition.z - front);
    const height = 2 * depth * Math.tan(camera.fov * Math.PI / 360) / camera.zoom;
    const width = height * camera.aspect;
    const mobile = innerWidth < 768;
    const path = smoothstep(0, 1, scroll);
    const travelX = mobile ? 0.24 : direction > 0 ? 0.4 : 0.16;
    const screenX = (mobile ? 0.04 : 0.25) * direction - travelX * path;
    // Align the round mesh with the leftward path before the handoff.
    // Release the offset when its formation leaves the camera, so the later
    // authored groups keep their existing journey without a lateral snap.
    const sourceWidth = 2 * Math.max(1, cameraPosition.z - worldPosition.z)
      * Math.tan(camera.fov * Math.PI / 360) / camera.zoom * camera.aspect;
    const alignment = smoothstep(0.35, 0.7, scroll)
      * (1 - smoothstep(0.11, 0.145, position));
    worldPosition.x += (cameraPosition.x + sourceWidth * screenX - worldPosition.x) * alignment;
    openingSource.position.copy(openingSource.parent.worldToLocal(worldPosition.clone()));
    if (blend >= 0.999) return;
    const time = (next.time || 0) / 1000;
    const float = Math.sin(time * 0.9) * height * 0.018;
    const diameter = mobile ? Math.min(height * 0.34, width * 0.86) : height * 0.56;
    // A people hub rolls left into the workspace, with only a gentle dip.
    openingForm.position.set(
      cameraPosition.x + width * screenX + (next.pointerX || 0) * height * 0.012,
      cameraPosition.y + height * (mobile ? 0.17 : 0.12) + float - path * height * (mobile ? 0.06 : 0.2),
      front,
    ).lerp(worldPosition, blend);
    openingForm.scale.setScalar(diameter).lerp(worldScale, blend);
    openingForm.rotation.set(
      Math.sin(time * 0.48) * 0.16,
      time * 0.16 + scroll * 2.8,
      Math.sin(time * 0.65) * 0.1 + path * 2.2,
    );
    openingForm.quaternion.slerp(worldRotation, blend);

    // Project the same rolling position and scale into the React layer, so it
    // meets the glass mesh in the canvas without a separate scroll timeline.
    const projected = openingForm.position.clone().project(camera);
    const viewHeight = 2 * Math.max(1, cameraPosition.z - openingForm.position.z)
      * Math.tan(camera.fov * Math.PI / 360) / camera.zoom;
    const bounds = canvasBounds;
    const size = openingForm.scale.x / viewHeight * bounds.height;
    const layout = openingArtwork.openingLayout;
    layout.centerX = bounds.left + (projected.x * 0.5 + 0.5) * bounds.width;
    layout.centerY = bounds.top + (-projected.y * 0.5 + 0.5) * bounds.height;
    layout.radius = size / 2;
    layout.roll = Math.sin(time * 0.65) * 0.1 + path * 2.2;

    const original = openingSource.material;
    openingMaterial.opacity = opacity;
    openingMaterial.transmission = original.transmission * finish;
    openingMaterial.thickness = 0.4 + (original.thickness - 0.4) * finish;
    openingMaterial.roughness = 0.7 + (original.roughness - 0.7) * finish;
    openingMaterial.clearcoat = 0.08 * (1 - finish) + original.clearcoat * finish;
    openingMaterial.clearcoatRoughness = 0.5 * (1 - finish) + original.clearcoatRoughness * finish;
    openingMaterial.specularIntensity = 0.22 * (1 - finish) + original.specularIntensity * finish;
    openingMaterial.sheen = original.sheen * finish;
    openingMaterial.emissiveIntensity = 0.004 * (1 - finish) + original.emissiveIntensity * finish;
    openingMaterial.color.copy(openingColor).lerp(original.color, finish);
    openingSurface.value = 1 - finish;
  }

  window.setSarjBackgroundFrame = (next) => {
    frame = next;
    if (!engine || !animation || lost || disposed || document.hidden) return;
    const renderStill = !initialized || enabled;
    enabled = next.enabled && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = performance.now();
    const interval = innerWidth < 768 ? 1000 / 30 : 1000 / 60;
    if (enabled && initialized && now - lastRenderTime < interval - 1) return;
    const delta = Math.min(Number.isFinite(lastRenderTime) ? (now - lastRenderTime) / 1000 : 1 / 60, 0.05);
    if (enabled || !initialized) {
      const target = sequencePosition(next.progress);
      if (!initialized) position = target;
      else {
        const step = (target - position) * (1 - Math.exp(-delta * 12));
        // Native jumps and reversing scroll must still pass through the
        // intermediate poses; deep links initialize directly at their pose.
        const limit = delta * 0.6;
        position += Math.max(-limit, Math.min(limit, step));
        if (Math.abs(target - position) < 1e-6) position = target;
      }
      animation.setPosition(position);
      // Theatre's change listeners normally run on a separate RAF. Apply all
      // values now so transforms and materials belong to this rendered frame.
      for (const id of animatedObjects) animation.reapplyObjectValues(id);
      // Damp wheel jumps once, so particles and the surface share one motion.
      const scrollTarget = Math.max(0, next.scroll || 0);
      if (!initialized) openingScroll = scrollTarget;
      else {
        openingScroll += (scrollTarget - openingScroll) * (1 - Math.exp(-delta * 12));
        if (Math.abs(scrollTarget - openingScroll) < 0.1) openingScroll = scrollTarget;
      }
      applyOpeningForm(next);
      initialized = true;
    }
    // The parent scroll clock owns rendering as well as timeline scrubbing.
    if (enabled || renderStill) {
      renderScene();
      lastRenderTime = now;
    }
  };

  const visibility = () => {
    if (!engine || lost || disposed || document.hidden) return;
    if (frame && enabled) window.setSarjBackgroundFrame(frame);
    else renderScene();
  };
  document.addEventListener("visibilitychange", visibility);
  const resize = () => {
    measureCanvas();
    if (!engine || !animation || lost || disposed || document.hidden) return;
    // Redraw after layout and responsive camera selection, even while paused.
    if (openingFrame) applyOpeningForm(openingFrame);
    renderScene();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const contextLost = (event) => {
    if (disposed) return;
    event.preventDefault();
    lost = true;
    engine?.stop();
    announce("sarj-background-unavailable");
  };
  const contextRestored = () => {
    if (disposed || !animation) return;
    lost = false;
    initialized = false;
    if (frame) window.setSarjBackgroundFrame(frame);
    announce("sarj-background-ready");
  };
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  window.disposeSarjBackgroundScene = () => {
    disposed = true;
    assetController.abort();
    assetLoads.clear();
    document.removeEventListener("visibilitychange", visibility);
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", contextLost);
    canvas.removeEventListener("webglcontextrestored", contextRestored);
    engine?.stop();
    openingForm?.removeFromParent();
    openingArtwork?.remove();
    openingMaterial?.dispose();
    engine?.dispose();
    engine?.renderer.forceContextLoss();
    resources.forEach((url) => URL.revokeObjectURL(url));
    resources.clear();
  };

  async function initialize() {
    // Match the renderer's attributes and reuse this canvas's
    // context. Unsupported browsers keep the parent page's static background.
    let capabilityOwner = window;
    try {
      if (parent.location.origin === location.origin) capabilityOwner = parent;
    } catch { /* A cross-origin embed keeps its own capability result. */ }
    if (capabilityOwner.__sarjHardwareWebGL === false) {
      announce("sarj-background-unavailable");
      return;
    }
    let context;
    try {
      context = canvas.getContext("webgl2", {
        powerPreference: innerWidth < 768 ? "low-power" : "high-performance",
        antialias: true,
        depth: true,
        alpha: true,
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      // Context creation may also be denied by browser privacy settings.
    }
    if (!context || context.isContextLost()) {
      announce("sarj-background-unavailable");
      return;
    }
    const info = context.getExtension("WEBGL_debug_renderer_info");
    if (info && /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(
      String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)),
    )) {
      capabilityOwner.__sarjHardwareWebGL = false;
      context.getExtension("WEBGL_lose_context")?.loseContext();
      announce("sarj-background-unavailable");
      return;
    }
    capabilityOwner.__sarjHardwareWebGL = true;
    // Load the background runtime after the GPU capability check.
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "renderer.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    if (disposed) return;
    const [runtime, scene, devices, scroll] = await Promise.all([
      sarjBackgroundRenderer,
      fetch("scene.json").then((response) => response.json()),
      fetch("devices.json").then((response) => response.json()),
      fetch("scroll.json").then((response) => response.json()),
    ]);
    if (disposed) return;
    profiles = scroll;
    themeScene(scene);
    connectFormations(scene);
    // Validate and cache each distinct model before the renderer creates its
    // dependent resources. Its internal loaders otherwise leave rejected model
    // promises unhandled on a network failure. Normal loads reuse these blobs.
    const modelUrls = new Set(Object.values(scene.engineState.pwObjects)
      .map((object) => object.object?.assetUrl).filter(Boolean));
    await Promise.all(Array.from(modelUrls, (url) => window._pwLoadFileFromCache(url)));
    if (disposed) return;
    engine = runtime.engine.Vyb(canvas, scene.engineState.autoResolutionSettings, false, "sarj-background");
    const ready = new Promise((resolve) => engine.listenTo(runtime.engine.bd5.SceneReady, resolve));
    engine.initializeClient(runtime.state.d9(scene.engineState), devices);
    const modelIds = new Set(Object.values(scene.engineState.pwObjects)
      .map((object) => object.object?.uuid).filter(Boolean));
    await Promise.all([ready, ...Array.from(modelIds, (id) => engine.getResource(id).assetInstance)]);
    if (disposed) return;
    if (assetsFailed) throw new Error("Background models unavailable");
    engine.animationsManager.setState(scene.animations.sheetsById);
    const sheetId = runtime.engine.H0X;
    animation = engine.animationsManager.getAnimation(sheetId);
    const tracks = scene.animations.sheetsById[sheetId].sequence.tracksByObject;
    for (const [id, track] of Object.entries(tracks)) {
      const object = engine.getMaterial(id) || engine.getObject(id) || engine.effects.get(id);
      if (object) {
        animation.registerObject(id, object, track);
        animatedObjects.push(id);
      }
    }
    engine.stop();
    measureCanvas();
    await createOpeningForm();
    if (disposed) return;
    window.setSarjBackgroundFrame(frame || { progress: 0, enabled: false });
    announce("sarj-background-ready");
  }
  initialize().catch((error) => {
    if (disposed) return;
    console.error("SARJ background:", error);
    engine?.stop();
    announce("sarj-background-unavailable");
  });
})();
