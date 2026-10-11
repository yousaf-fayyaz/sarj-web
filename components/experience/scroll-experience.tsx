"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type Lenis from "lenis";
import type { Locale } from "@/lib/content";
import { installViewportNavigation } from "@/lib/viewport-navigation";
import {
  getMotionPreference,
  getServerMotionPreference,
  publishScrollFrame,
  setMotionPaused,
  subscribeMotionPreference,
} from "@/lib/scroll-motion";

export function ScrollExperience({ locale }: { locale: Locale }) {
  const preference = useSyncExternalStore(
    subscribeMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const enabled = preference === "enabled";
  const elapsed = useRef(0);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".site");
    if (!root) return;
    let disposed = false;
    let lenis: Lenis | undefined;
    let frame = 0;
    let last = 0;
    let previousScroll = window.scrollY;
    let velocity = 0;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let limit = 1;
    let compact = window.innerWidth < 768;
    let previousProgress = "";
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const progress = root.querySelector<HTMLElement>(".reading-progress");
    const artwork = Array.from(
      root.querySelectorAll<HTMLElement>(".feature-story-art"),
    );
    let artworkBounds: { element: HTMLElement; center: number }[] = [];
    root.dataset.motion = enabled ? "enabled" : "paused";
    document.documentElement.dataset.motion = root.dataset.motion;
    if (!root.dataset.motionInitialized || root.dataset.loading === "true") {
      root.dataset.motionInitialized = "true";
      if (enabled) root.dataset.intro = "true";
    }
    let introTimer = 0;
    const startIntro = () => {
      if (root.dataset.loading === "true") return;
      if (enabled && root.dataset.intro === "true" && !introTimer) {
        introTimer = window.setTimeout(() => delete root.dataset.intro, 1600);
      }
    };
    const loadingObserver = new MutationObserver(startIntro);
    loadingObserver.observe(root, { attributes: true, attributeFilter: ["data-loading"] });
    startIntro();

    const measure = () => {
      const headerHeight =
        root.querySelector(".site-header")?.getBoundingClientRect().height ??
        76;
      const small = innerWidth < 768;
      const padding = Math.max(
        small ? 12 : 16,
        Math.min(small ? 20 : 36, innerHeight * (small ? 0.02 : 0.03)),
      );
      const dimensions = {
        "--viewport-height": innerHeight,
        "--stage-height": innerHeight - headerHeight,
        "--stage-padding": padding,
        "--stage-content-height": innerHeight - headerHeight - padding * 2,
      };
      for (const [property, value] of Object.entries(dimensions)) {
        const pixels = `${value}px`;
        if (
          document.documentElement.style.getPropertyValue(property) !== pixels
        ) {
          document.documentElement.style.setProperty(property, pixels);
        }
      }
      limit = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      compact = innerWidth < 768;
      artworkBounds = artwork.map((element) => {
        const rect = element.getBoundingClientRect();
        return { element, center: rect.top + window.scrollY + rect.height / 2 };
      });
      lenis?.resize();
    };

    const render = (time: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      const delta = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60;
      last = time;
      lenis?.raf(time);
      const active = enabled && root.dataset.loading !== "true"
        && !document.body.hasAttribute("data-scroll-locked");
      const scroll = window.scrollY;
      const blend = 1 - Math.exp(-delta * 9);
      const targetVelocity = enabled
        ? Math.max(-1, Math.min(1, (scroll - previousScroll) / (delta * 1800)))
        : 0;
      velocity += (targetVelocity - velocity) * blend;
      previousScroll = scroll;
      pointerX += ((enabled ? targetX : 0) - pointerX) * blend;
      pointerY += ((enabled ? targetY : 0) - pointerY) * blend;
      if (active) elapsed.current += delta * 1000;
      const ratio = Math.min(1, Math.max(0, scroll / limit));
      const progressTransform = `scaleX(${ratio})`;
      if (progress && progressTransform !== previousProgress) {
        progress.style.transform = progressTransform;
        previousProgress = progressTransform;
      }
      for (const { element, center } of artworkBounds) {
        const distance = center - scroll - innerHeight / 2;
        if (!enabled || compact || Math.abs(distance) < innerHeight) {
          const offset =
            enabled && !compact
              ? Math.max(-28, Math.min(28, distance * 0.045))
              : 0;
          element.style.setProperty("--art-drift", `${offset.toFixed(2)}px`);
        }
      }
      publishScrollFrame({
        time: elapsed.current,
        delta,
        scroll,
        progress: ratio,
        velocity,
        pointerX,
        pointerY,
        enabled: active,
        compact,
      });
      if (enabled) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(render);
    };
    const resize = () => {
      measure();
      schedule();
    };
    const pointer = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType === "touch") return;
      targetX = (event.clientX / innerWidth - 0.5) * 2;
      targetY = (event.clientY / innerHeight - 0.5) * 2;
    };
    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      previousScroll = window.scrollY;
      resetPointer();
      if (!document.hidden) {
        lenis?.scrollTo(window.scrollY, { immediate: true });
        schedule();
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    const syncScrollLock = () => {
      if (document.body.hasAttribute("data-scroll-locked")) lenis?.stop();
      else lenis?.start();
    };
    const scrollLockObserver = new MutationObserver(syncScrollLock);
    scrollLockObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked"],
    });
    measure();
    schedule();
    const removeViewportNavigation = installViewportNavigation(root, (top, immediate = false) => {
      if (lenis) {
        if (!immediate) lenis.scrollTo(window.scrollY, { immediate: true });
        lenis.scrollTo(top, { immediate });
      } else {
        window.scrollTo({ top, behavior: enabled && !immediate ? "smooth" : "instant" });
      }
    });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    if (enabled) {
      window.addEventListener("pointermove", pointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", resetPointer);
      import("lenis")
        .then(({ default: Lenis }) => {
          if (disposed) return;
          lenis = new Lenis({
            // Accumulate every wheel delta instead of snapping to reading stages.
            lerp: 0.1,
            smoothWheel: true,
            syncTouch: false,
            // Native workspace scrolling hands wheel input back to the page at its edges.
            allowNestedScroll: true,
            // The artwork and Lenis share the render loop above.
            autoRaf: false,
            autoResize: false,
            // Our anchor handler also preserves history, focus and menu closing.
            anchors: false,
            stopInertiaOnNavigate: true,
            virtualScroll: ({ event, deltaX, deltaY }) =>
              !event.metaKey &&
              !event.shiftKey &&
              Math.abs(deltaY) >= Math.abs(deltaX),
          });
          syncScrollLock();
          measure();
        })
        .catch(() => {
          // Native scrolling still drives the artwork if Lenis cannot load.
        });
    }
    return () => {
      disposed = true;
      clearTimeout(introTimer);
      loadingObserver.disconnect();
      delete root.dataset.intro;
      cancelAnimationFrame(frame);
      lenis?.destroy();
      removeViewportNavigation();
      observer.disconnect();
      scrollLockObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", pointer);
      document.documentElement.removeEventListener(
        "pointerleave",
        resetPointer,
      );
      document.removeEventListener("visibilitychange", visibility);
      delete root.dataset.motion;
      delete document.documentElement.dataset.motion;
      [
        "--viewport-height",
        "--stage-height",
        "--stage-padding",
        "--stage-content-height",
      ].forEach((property) =>
        document.documentElement.style.removeProperty(property),
      );
      artwork.forEach((element) => element.style.removeProperty("--art-drift"));
    };
  }, [enabled]);

  const label =
    preference === "system"
      ? locale === "ar"
        ? "حركة مخفّضة"
        : "Reduced motion"
      : enabled
        ? locale === "ar"
          ? "إيقاف الحركة"
          : "Pause motion"
        : locale === "ar"
          ? "تشغيل الحركة"
          : "Enable motion";

  return (
    <>
      <div className="reading-progress" aria-hidden="true" />
      <button
        type="button"
        className="motion-toggle"
        aria-label={label}
        disabled={preference === "system"}
        onClick={() => setMotionPaused(enabled)}
      >
        {enabled ? (
          <Pause size={13} aria-hidden="true" />
        ) : (
          <Play size={13} aria-hidden="true" />
        )}
        <span>{label}</span>
      </button>
    </>
  );
}
