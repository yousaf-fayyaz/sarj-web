'use client';

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import { canAttemptHardwareWebGL, supportsHardwareWebGL } from '@/lib/webgl-support';
import './SideRays.css';

const hexToRgb = hex => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const originToFlip = origin => {
  switch (origin) {
    case 'top-left': return [1, 0];
    case 'bottom-right': return [0, 1];
    case 'bottom-left': return [1, 1];
    default: return [0, 0];
  }
};

const SideRays = ({
  speed = 2.5,
  paused = false,
  onReady,
  onUnavailable,
  rayColor1 = '#EAB308',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = ''
}) => {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const meshRef = useRef(null);
  const cleanupFunctionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);
  const settingsRef = useRef(null);
  const wakeRef = useRef(null);

  useEffect(() => {
    settingsRef.current = { paused, speed, onReady, onUnavailable };
    wakeRef.current?.();
  }, [paused, speed, onReady, onUnavailable]);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    let cancelled = false;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }

    const initializeWebGL = async () => {
      if (cancelled || !containerRef.current) return;

      await new Promise(resolve => setTimeout(resolve, 10));

      if (cancelled || !containerRef.current) return;

      if (!canAttemptHardwareWebGL()) {
        settingsRef.current?.onUnavailable?.();
        return;
      }
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true });
      if (!supportsHardwareWebGL(context)) {
        context?.getExtension('WEBGL_lose_context')?.loseContext();
        settingsRef.current?.onUnavailable?.();
        return;
      }
      const renderer = new Renderer({
        canvas,
        dpr: 1,
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: 'low-power'
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      if (!gl) {
        settingsRef.current?.onUnavailable?.();
        return;
      }
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`;

      const [flipX, flipY] = originToFlip(origin);
      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        iSpeed: { value: settingsRef.current?.speed ?? 0 },
        iRayColor1: { value: hexToRgb(rayColor1) },
        iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity },
        iSpread: { value: spread },
        iFlipX: { value: flipX },
        iFlipY: { value: flipY },
        iTilt: { value: tilt },
        iSaturation: { value: saturation },
        iBlend: { value: blend },
        iFalloff: { value: falloff },
        iOpacity: { value: opacity }
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updateSize = () => {
        if (!containerRef.current || !renderer) return;
        const { clientWidth: w, clientHeight: h } = containerRef.current;
        if (!w || !h) return;
        const dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5,
          Math.sqrt(2e6 / (w * h)));
        if (renderer.width === w && renderer.height === h && renderer.dpr === dpr) return;
        renderer.dpr = dpr;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
        start();
      };

      let announcedReady = false;
      const loop = t => {
        animationIdRef.current = null;
        if (document.hidden || !rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniforms.iTime.value = t * 0.001;
        try {
          renderer.render({ scene: mesh });
          if (!announcedReady) {
            announcedReady = true;
            settingsRef.current?.onReady?.();
          }
          if (!settingsRef.current?.paused && uniforms.iSpeed.value > 0) {
            animationIdRef.current = requestAnimationFrame(loop);
          }
        } catch {
          settingsRef.current?.onUnavailable?.();
          return;
        }
      };
      const start = () => {
        if (!cancelled && !document.hidden && animationIdRef.current === null) {
          animationIdRef.current = requestAnimationFrame(loop);
        }
      };
      wakeRef.current = start;
      const visibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        } else start();
      };

      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(containerRef.current);
      document.addEventListener('visibilitychange', visibility);
      updateSize();

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        geometry.remove();
        program.remove();
        if (renderer) {
          try {
            const loseCtx = renderer.gl.getExtension('WEBGL_lose_context');
            if (loseCtx) loseCtx.loseContext();
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          } catch {}
        }
        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
        wakeRef.current = null;
      };
    };

    initializeWebGL().catch(() => {
      if (!cancelled) settingsRef.current?.onUnavailable?.();
    });

    return () => {
      cancelled = true;
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [isVisible, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;
    u.iSpeed.value = speed;
    u.iRayColor1.value = hexToRgb(rayColor1);
    u.iRayColor2.value = hexToRgb(rayColor2);
    u.iIntensity.value = intensity;
    u.iSpread.value = spread;
    const [flipX, flipY] = originToFlip(origin);
    u.iFlipX.value = flipX;
    u.iFlipY.value = flipY;
    u.iTilt.value = tilt;
    u.iSaturation.value = saturation;
    u.iBlend.value = blend;
    u.iFalloff.value = falloff;
    u.iOpacity.value = opacity;
    wakeRef.current?.();
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  return <div ref={containerRef} className={`side-rays-container ${className}`.trim()} />;
};

export default SideRays;
