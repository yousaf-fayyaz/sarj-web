type HardwareWindow = Window & { __sarjHardwareWebGL?: boolean };

function capabilityWindow(): HardwareWindow {
  try {
    if (window.parent.location.origin === window.location.origin) return window.parent;
  } catch {
    // A cross-origin embed keeps its own capability result.
  }
  return window;
}

/** Share a software-renderer result between decorative canvases and the scene iframe. */
export function canAttemptHardwareWebGL() {
  return capabilityWindow().__sarjHardwareWebGL !== false;
}

/** Software rasterizers make decorative shaders compete with page interaction. */
export function supportsHardwareWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext | null) {
  if (!gl || gl.isContextLost()) return false;
  const owner = capabilityWindow();
  if (owner.__sarjHardwareWebGL !== undefined) return owner.__sarjHardwareWebGL;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  // Privacy settings can hide renderer details; allow those working contexts.
  const supported = !info || !/swiftshader|llvmpipe|softpipe|software rasterizer/i.test(
    String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)),
  );
  owner.__sarjHardwareWebGL = supported;
  return supported;
}
