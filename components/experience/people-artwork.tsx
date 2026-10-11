"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { AudienceRole } from "@/lib/people-preview";
import { subscribeScrollFrame } from "@/lib/scroll-motion";
import styles from "./people-columns.module.css";

const artwork = {
  hr: "/images/team/hr-wave.webp",
  finance: "/images/team/finance-wave.webp",
  employee: "/images/team/employee-globe.webp",
};

export function PeopleArtwork({ role }: { role: AudienceRole }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    // Share the page's motion clock so hidden, covered, and offscreen artwork
    // pauses without changing its current appearance or animation position.
    let visible = false;
    let enabled = false;
    const syncAnimation = () => {
      element.dataset.animated = String(visible && enabled && !document.hidden);
    };
    const unsubscribe = subscribeScrollFrame((frame) => {
      if (enabled === frame.enabled) return;
      enabled = frame.enabled;
      syncAnimation();
    });
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      element.dataset.visible = String(visible);
      syncAnimation();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", syncAnimation);
    return () => {
      observer.disconnect();
      unsubscribe();
      document.removeEventListener("visibilitychange", syncAnimation);
    };
  }, []);

  return (
    <div className={styles.artwork} ref={host} data-team-artwork aria-hidden="true">
      <div className={styles.imageMotion}>
        <Image
          src={artwork[role]}
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1439px) 50vw, 640px"
          className={styles.image}
        />
        <span className={styles.tint} />
      </div>
      <span className={styles.glow} />
    </div>
  );
}
