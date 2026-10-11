"use client";

import { useEffect, useRef } from "react";
import { getMotionPreference, subscribeMotionPreference } from "@/lib/scroll-motion";

/** The server-rendered artwork is visible before the optional GPU enhancement. */
export function ArtworkMotion() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const root = element?.closest<HTMLElement>(".site");
    if (!element || !root) return;
    const artwork = root.querySelectorAll<HTMLElement>("[data-sculpture]");
    if (!artwork.length) return;

    let disposed = false;
    let nearby = false;
    let loading = false;
    let cleanup: (() => void) | undefined;
    const initialize = () => {
      if (disposed || loading || !nearby || getMotionPreference() !== "enabled") return;
      loading = true;
      import("@/lib/artwork-renderer")
        .then(({ createArtworkRenderer }) => {
          if (!disposed) cleanup = createArtworkRenderer(element, root);
        })
        .catch(() => {
          // Each scene keeps its SVG or image fallback when WebGL is unavailable.
        });
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        nearby = true;
        initialize();
      }
    }, { rootMargin: "350px" });
    artwork.forEach((target) => observer.observe(target));
    const unsubscribe = subscribeMotionPreference(initialize);

    return () => {
      disposed = true;
      observer.disconnect();
      unsubscribe();
      cleanup?.();
    };
  }, []);

  return <canvas className="artwork-webgl" ref={canvas} aria-hidden="true" />;
}
