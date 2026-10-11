"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { CrystalizedBallLayout } from "@/components/CrystalizedBall";
import { getMotionPreference, getServerMotionPreference, subscribeMotionPreference, subscribeScrollFrame } from "@/lib/scroll-motion";
import { useAssetReady, useBackgroundEnabled, useExperienceLoading } from "./preloader";

const CrystalizedBall = dynamic(() => import("@/components/CrystalizedBall"), {
  ssr: false,
});

// Fixed seeds keep the star field identical during server rendering and hydration.
const particles = Array.from({ length: 64 }, (_, index) => {
  const depth = index % 4 === 0 ? 1 : index % 3 === 0 ? 0.6 : 0.3;
  return {
    "--particle-x": `${((index * 47.137 + 7.83) % 100).toFixed(2)}%`,
    "--particle-y": `${(10 + ((index * 31.731 + 6.41) % 78)).toFixed(2)}%`,
    "--particle-size": `${(0.7 + depth * 1.7).toFixed(2)}px`,
    "--particle-alpha": (0.3 + depth * 0.5).toFixed(2),
    "--particle-travel-x": `${-24 - depth * 62}px`,
    "--particle-travel-y": `${-12 - depth * 38}px`,
    "--particle-duration": `${42 - depth * 22}s`,
    "--particle-delay": `${-((index * 7.31) % 40).toFixed(2)}s`,
    "--particle-twinkle": `${(4 + ((index * 1.37) % 5)).toFixed(2)}s`,
  } as CSSProperties;
});

export function Atmosphere() {
  const completeAsset = useAssetReady();
  const backgroundEnabled = useBackgroundEnabled();
  const preloading = useExperienceLoading();
  const preference = useSyncExternalStore(subscribeMotionPreference, getMotionPreference, getServerMotionPreference);
  const host = useRef<HTMLDivElement>(null);
  const openingProgress = useRef(0);
  const openingLayout = useRef<CrystalizedBallLayout | null>(null);
  const [openingHost, setOpeningHost] = useState<HTMLElement | null>(null);
  const [openingPaused, setOpeningPaused] = useState(false);
  const paused = preloading || openingPaused || preference !== "enabled";
  useEffect(() => {
    const element = host.current;
    if (!element || !backgroundEnabled) return;
    let disposed = false;
    let cleanup = () => {};
    let previousPaused: boolean | undefined;
    let progressInitialized = false;
    const unsubscribe = subscribeScrollFrame((frame) => {
      if (frame.enabled || !progressInitialized) {
        openingProgress.current = Math.max(0, frame.scroll / Math.max(1, innerHeight));
        progressInitialized = true;
      }
      const paused = !frame.enabled || frame.scroll >= innerHeight;
      if (paused !== previousPaused) {
        previousPaused = paused;
        setOpeningPaused(paused);
      }
    });
    import("@/lib/atmosphere-scene")
      .then(({ createAtmosphereScene }) => {
        if (disposed) return;
        cleanup = createAtmosphereScene(element, (mount, layout) => {
          if (!disposed) {
            openingLayout.current = layout;
            setOpeningHost(mount);
          }
        }, (available) => {
          if (disposed) return;
          completeAsset("scene", available);
          if (!available) completeAsset("particles");
        });
      })
      .catch(() => {
        // The static background remains visible if loading fails.
        if (!disposed) {
          completeAsset("scene", false);
          completeAsset("particles");
        }
      });
    return () => {
      disposed = true;
      unsubscribe();
      cleanup();
    };
  }, [completeAsset, backgroundEnabled]);
  return (
    <div className="atmosphere" ref={host} aria-hidden="true">
      <div className="atmosphere-fallback">
        <div className="atmosphere-orb-fallback" />
      </div>
      <div className="atmosphere-haze" />
      <div className="atmosphere-dust">
        {particles.map((style, index) => (
          <i key={index} style={style} />
        ))}
      </div>
      {backgroundEnabled && openingHost && createPortal(
        <CrystalizedBall
          preset="plasma"
          color="#435832"
          size={0.7}
          crackle={0.85}
          fill={0.5}
          particleDistribution="uniform"
          motion="drift"
          interactive={!paused}
          hoverStrength={0.7}
          paused={paused}
          scrollProgressRef={openingProgress}
          layoutRef={openingLayout}
          intro={false}
          onReady={() => completeAsset("particles")}
          onUnavailable={() => completeAsset("particles")}
          style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
        />,
        openingHost,
      )}
    </div>
  );
}
