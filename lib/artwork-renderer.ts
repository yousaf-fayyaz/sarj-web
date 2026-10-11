import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ArtworkResources, createArtworkModel, type ArtworkModel } from "./artwork-scenes";
import { subscribeScrollFrame, type ScrollFrame } from "./scroll-motion";
import { supportsHardwareWebGL } from "./webgl-support";

type ArtworkView = {
  element: HTMLElement;
  boundary: HTMLElement;
  interaction: HTMLElement;
  key: string;
  scene?: THREE.Scene;
  camera?: THREE.OrthographicCamera;
  pose?: THREE.Group;
  model?: ArtworkModel;
  ready: boolean;
  age: number;
  engagement: number;
  pointerX: number;
  pointerY: number;
  targetX: number;
  targetY: number;
  engaged: boolean;
  removeEvents: () => void;
};

/** One context, multiple scissored views; the page's existing clock drives them all. */
export function createArtworkRenderer(canvas: HTMLCanvasElement, root: HTMLElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    const contextAttributes: WebGLContextAttributes = {
      alpha: true,
      antialias: true,
      powerPreference: innerWidth < 768 ? "low-power" : "high-performance",
      failIfMajorPerformanceCaveat: true,
    };
    // Check the actual canvas before Three.js installs its error-reporting
    // listeners. A blocked GPU is an expected static-artwork fallback.
    const context = canvas.getContext("webgl2", contextAttributes);
    if (!context || !supportsHardwareWebGL(context)) {
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return () => {};
    }
    renderer = new THREE.WebGLRenderer({
      canvas,
      context,
      ...contextAttributes,
    });
  } catch {
    return () => {};
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.autoClear = false;

  const resources = new ArtworkResources();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  let environment = pmrem.fromScene(room, 0.06);
  room.dispose();
  pmrem.dispose();

  let disposed = false;
  let lost = false;
  let scheduled = 0;
  let latest: ScrollFrame | undefined;
  let lastRendered = -Infinity;
  let hadContent = false;
  let width = 0;
  let height = 0;
  let pixelRatio = 0;
  let elapsed = 0;
  const visible = new Set<ArtworkView>();
  const views = Array.from(root.querySelectorAll<HTMLElement>("[data-sculpture]")).map((element): ArtworkView => {
    const interaction = element.closest<HTMLElement>(".module-card, .feature-story-art, .about-art, .contact-panel") ?? element;
    const view: ArtworkView = {
      element,
      boundary: element.closest<HTMLElement>(".module-art, .feature-story-art, .about-art, .contact-panel") ?? element,
      interaction, key: element.dataset.sculpture ?? "abstract-0",
      ready: false, age: 0, engagement: 0, pointerX: 0, pointerY: 0,
      targetX: 0, targetY: 0, engaged: false, removeEvents: () => {},
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const rect = interaction.getBoundingClientRect();
      view.targetX = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      view.targetY = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      view.engaged = true;
    };
    const reset = () => {
      view.targetX = 0;
      view.targetY = 0;
      view.engaged = interaction.matches(":focus-visible");
    };
    const focus = () => { view.engaged = true; };
    interaction.addEventListener("pointermove", pointer, { passive: true });
    interaction.addEventListener("pointerleave", reset);
    interaction.addEventListener("focusin", focus);
    interaction.addEventListener("focusout", reset);
    view.removeEvents = () => {
      interaction.removeEventListener("pointermove", pointer);
      interaction.removeEventListener("pointerleave", reset);
      interaction.removeEventListener("focusin", focus);
      interaction.removeEventListener("focusout", reset);
    };
    return view;
  });
  const byElement = new Map(views.map((view) => [view.element, view]));

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1.25 : 1.5,
      Math.sqrt(2.5e6 / Math.max(1, innerWidth * innerHeight)));
    if (width === innerWidth && height === innerHeight && dpr === pixelRatio) return;
    width = innerWidth;
    height = innerHeight;
    pixelRatio = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    requestRender();
  };

  const initializeView = (view: ArtworkView) => {
    if (view.scene) return;
    const scene = new THREE.Scene();
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.55;
    scene.add(new THREE.HemisphereLight(0xe9f3d8, 0x102619, 0.7));
    const key = new THREE.DirectionalLight(0xf3f7e8, 2.6);
    key.position.set(-3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd0efab, 2.3);
    rim.position.set(4, 1.5, -3);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x8da997, 0.55);
    fill.position.set(3, -2, 4);
    scene.add(fill);

    const camera = new THREE.OrthographicCamera(-3, 3, 2.2, -2.2, 0.1, 30);
    camera.position.set(0, 0.12, 9);
    camera.lookAt(0, 0.12, 0);
    const pose = new THREE.Group();
    const model = createArtworkModel(view.key, resources);
    pose.add(model.root);
    pose.rotation.set(-0.12, -0.32, -0.08);
    scene.add(pose);

    // Sparse, deterministic light motes add depth without a postprocessing pass.
    const points = resources.geometry("light-motes", () => {
      const vertices: number[] = [];
      for (let i = 0; i < 18; i++) {
        const angle = i * 2.39996;
        const radius = 1.38 + (i % 4) * 0.13;
        vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.68, -0.8 - (i % 3) * 0.12);
      }
      return new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    });
    const motes = new THREE.Points(points, resources.material(new THREE.PointsMaterial({
      color: 0xc6dda8, size: 0.018, sizeAttenuation: true,
      transparent: true, opacity: 0.38, depthWrite: false,
    })));
    scene.add(motes);
    view.scene = scene;
    view.camera = camera;
    view.pose = pose;
    view.model = model;
    model.update(0, 0, 1);
    // Compile outside the first visible animation frame to avoid a shader hitch.
    const compilation = renderer.extensions.has("KHR_parallel_shader_compile")
      ? renderer.compileAsync(scene, camera)
      : Promise.resolve(renderer.compile(scene, camera));
    compilation.then(() => {
      if (disposed || lost) return;
      view.ready = true;
      requestRender();
    }).catch(() => {
      // Leave this instance's server-rendered art in place if compilation fails.
    });
  };

  const render = (force = false) => {
    if (disposed || lost || document.hidden || !latest) return;
    const interval = latest.compact ? 1000 / 30 : 1000 / 60;
    if (!force && latest.enabled && latest.time - lastRendered < interval - 1) return;
    lastRendered = latest.time;
    const delta = Math.min(elapsed, 0.1);
    elapsed = 0;
    if (!visible.size && !hadContent) return;

    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    let count = 0;
    for (const view of visible) {
      if (view.element.closest('[data-entered="false"]')) continue;
      const rect = view.element.getBoundingClientRect();
      const clip = view.boundary.getBoundingClientRect();
      const left = Math.max(0, rect.left, clip.left);
      const right = Math.min(width, rect.right, clip.right);
      const top = Math.max(0, rect.top, clip.top);
      const bottom = Math.min(height, rect.bottom, clip.bottom);
      if (right <= left || bottom <= top || !rect.width || !rect.height) continue;
      initializeView(view);
      if (!view.ready || !view.scene || !view.camera || !view.pose || !view.model) continue;

      const aspect = rect.width / rect.height;
      const span = view.key.startsWith("abstract") ? 4.8 : 4.15;
      const frustumHeight = Math.max(span, span * (520 / 380) / aspect);
      view.camera.left = -frustumHeight * aspect / 2;
      view.camera.right = frustumHeight * aspect / 2;
      view.camera.top = frustumHeight / 2;
      view.camera.bottom = -frustumHeight / 2;
      view.camera.updateProjectionMatrix();

      if (latest.enabled) {
        view.age += delta;
        const blend = 1 - Math.exp(-delta * 7);
        view.engagement += ((view.engaged ? 1 : 0) - view.engagement) * blend;
        view.pointerX += (view.targetX - view.pointerX) * blend;
        view.pointerY += (view.targetY - view.pointerY) * blend;
        const time = latest.time / 1000;
        const entrance = Math.min(1, view.age / 1.25);
        view.model.update(time, view.engagement, entrance);
        view.pose.rotation.x = -0.12 + view.pointerY * 0.12 + Math.sin(time * 0.45) * 0.035;
        view.pose.rotation.y = -0.32 + view.pointerX * 0.24 + Math.sin(time * 0.38) * 0.08 + latest.velocity * 0.045;
        view.pose.rotation.z = -0.08 + Math.sin(time * 0.3) * 0.018;
        view.pose.position.y = Math.sin(time * 0.65) * 0.04;
        view.pose.scale.setScalar(0.92 + entrance * 0.08 + view.engagement * 0.04);
      }
      renderer.setViewport(rect.left, height - rect.bottom, rect.width, rect.height);
      renderer.setScissor(left, height - bottom, right - left, bottom - top);
      renderer.render(view.scene, view.camera);
      if (view.element.dataset.artReady !== "true") view.element.dataset.artReady = "true";
      count++;
    }
    hadContent = count > 0;
    if (canvas.dataset.activeScenes !== String(count)) canvas.dataset.activeScenes = String(count);
    if (canvas.dataset.ready !== "true") canvas.dataset.ready = "true";
  };

  function requestRender() {
    if (scheduled || disposed) return;
    scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      render(true);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const view = byElement.get(entry.target as HTMLElement);
      if (!view) continue;
      if (entry.isIntersecting) visible.add(view);
      else visible.delete(view);
    }
    requestRender();
  });
  views.forEach((view) => observer.observe(view.element));
  const resizeObserver = new ResizeObserver(() => { resize(); requestRender(); });
  resizeObserver.observe(root);
  const unsubscribe = subscribeScrollFrame((frame) => {
    latest = frame;
    if (frame.enabled) elapsed += frame.delta;
    render();
  });
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(scheduled);
      scheduled = 0;
      elapsed = 0;
    } else requestRender();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    delete canvas.dataset.ready;
    views.forEach((view) => delete view.element.dataset.artReady);
  };
  const contextRestored = () => {
    lost = false;
    lastRendered = -Infinity;
    // Render-target textures are empty after context loss; rebuild the studio map.
    environment.dispose();
    const generator = new THREE.PMREMGenerator(renderer);
    const studio = new RoomEnvironment();
    environment = generator.fromScene(studio, 0.06);
    studio.dispose();
    generator.dispose();
    views.forEach((view) => {
      if (!view.scene || !view.camera) return;
      view.scene.environment = environment.texture;
      renderer.compile(view.scene, view.camera);
      view.ready = true;
    });
    resize();
    requestRender();
  };
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("resize", resize, { passive: true });
  resize();

  return () => {
    disposed = true;
    cancelAnimationFrame(scheduled);
    unsubscribe();
    observer.disconnect();
    resizeObserver.disconnect();
    views.forEach((view) => {
      view.removeEvents();
      delete view.element.dataset.artReady;
      view.scene?.clear();
    });
    canvas.removeEventListener("webglcontextlost", contextLost);
    canvas.removeEventListener("webglcontextrestored", contextRestored);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("resize", resize);
    resources.dispose();
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    delete canvas.dataset.ready;
    delete canvas.dataset.activeScenes;
  };
}
