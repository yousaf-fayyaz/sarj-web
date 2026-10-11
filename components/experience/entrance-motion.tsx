"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getMotionPreference,
  getServerMotionPreference,
  subscribeMotionPreference,
} from "@/lib/scroll-motion";

export function EntranceMotion() {
  const preference = useSyncExternalStore(
    subscribeMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const enabled = preference === "enabled";
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".site");
    if (!root || !enabled) return;
    const elements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    // Read positions together before attributes change reveal styles.
    const belowFold = new Set(elements.filter(element => element.getBoundingClientRect().top > innerHeight));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-entered", "true");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    elements.forEach((element) => {
      if (element.parentElement?.classList.contains("module-grid")) {
        const index = Array.from(element.parentElement.children).indexOf(
          element,
        );
        element.style.setProperty("--reveal-delay", `${(index % 3) * 65}ms`);
      }
      if (
        !element.hasAttribute("data-entered") &&
        belowFold.has(element)
      )
        element.setAttribute("data-entered", "false");
      observer.observe(element);
    });
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-reveal]");
      if (element) {
        element.setAttribute("data-entered", "true");
        observer.unobserve(element);
      }
    };
    root.addEventListener("focusin", revealFocused);
    return () => {
      observer.disconnect();
      root.removeEventListener("focusin", revealFocused);
      elements.forEach((element) => {
        element.setAttribute("data-entered", "true");
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, [enabled]);
  return null;
}
