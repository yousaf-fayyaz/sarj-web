"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getMotionPreference,
  getServerMotionPreference,
  subscribeMotionPreference,
  subscribeScrollFrame,
} from "@/lib/scroll-motion";
import styles from "./hero-rays.module.css";
import { useAssetReady, useBackgroundEnabled, useExperienceLoading } from "./preloader";

const SideRays = dynamic(() => import("@/components/SideRays"), {
  ssr: false,
});

export function HeroRays() {
  const completeAsset = useAssetReady();
  const backgroundEnabled = useBackgroundEnabled();
  const preloading = useExperienceLoading();
  const preference = useSyncExternalStore(
    subscribeMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const [clockPaused, setClockPaused] = useState(true);
  useEffect(() => subscribeScrollFrame(frame => setClockPaused(!frame.enabled)), []);

  return (
    <div className={styles.rays} aria-hidden="true">
      {backgroundEnabled && <SideRays
        origin="top-right"
        rayColor1="#b8d58f"
        rayColor2="#7d9c57"
        speed={preference === "enabled" ? 0.45 : 0}
        paused={preloading || clockPaused || preference !== "enabled"}
        onReady={() => completeAsset("rays")}
        onUnavailable={() => completeAsset("rays")}
        intensity={3.6}
        spread={2.2}
        tilt={-8}
        saturation={1}
        blend={0.35}
        falloff={1.25}
        opacity={1}
      />}
    </div>
  );
}
