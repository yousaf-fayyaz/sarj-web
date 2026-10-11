"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getMotionPreference, subscribeMotionPreference } from "@/lib/scroll-motion";
import { alignViewportStage, scrollViewportTo } from "@/lib/viewport-navigation";

export function ServiceRail({ children, labels, hint, previous, next, goTo, locale }: {
  children: ReactNode;
  labels: string[];
  hint: string;
  previous: string;
  next: string;
  goTo: string;
  locale: "en" | "ar";
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const navigation = useRef<number | null>(null);
  const tiltedCard = useRef<HTMLElement | null>(null);
  const motionEnabled = useRef(true);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const wheelMotion = useRef({ frame: 0, target: 0, time: 0 });
  const rtl = locale === "ar";
  const direction = rtl ? -1 : 1;

  function stopWheelMotion() {
    cancelAnimationFrame(wheelMotion.current.frame);
    wheelMotion.current.frame = 0;
    wheelMotion.current.time = 0;
  }

  function step() {
    const element = viewport.current;
    const card = element?.firstElementChild;
    return element && card instanceof HTMLElement
      ? card.offsetWidth + (parseFloat(getComputedStyle(element).columnGap) || 0)
      : 0;
  }

  function moveTo(index: number) {
    stopWheelMotion();
    const target = Math.max(0, Math.min(labels.length - 1, index));
    navigation.current = target;
    setActive(target);
    const element = viewport.current;
    element?.scrollTo({
      left: direction * Math.min(element.scrollWidth - element.clientWidth, step() * target),
      behavior: getMotionPreference() === "enabled" ? "smooth" : "instant",
    });
  }

  function resetTilt() {
    const card = tiltedCard.current;
    if (!card) return;
    ["--card-rotate-x", "--card-rotate-y", "--card-pointer-x", "--card-pointer-y"].forEach((property) => card.style.removeProperty(property));
    tiltedCard.current = null;
  }

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const overview = element.closest<HTMLElement>(".platform-overview");
    const update = () => {
      const max = element.scrollWidth - element.clientWidth;
      const distance = Math.max(0, direction * element.scrollLeft);
      const card = element.firstElementChild;
      const width = card instanceof HTMLElement ? card.offsetWidth + (parseFloat(getComputedStyle(element).columnGap) || 0) : 1;
      const index = max > 0 && distance >= max - 1
        ? labels.length - 1
        : Math.min(labels.length - 1, Math.round(distance / width));
      progress.current?.style.setProperty("--rail-progress", `${max > 0 ? distance / max : 0}`);
      setActive(navigation.current ?? index);
    };
    const animateWheel = (time: number) => {
      const animation = wheelMotion.current;
      const delta = animation.time ? Math.min(time - animation.time, 64) : 1000 / 60;
      animation.time = time;
      const remaining = animation.target - element.scrollLeft;
      // Some browsers round scrollLeft to whole pixels; finish before easing stalls.
      const finished = Math.abs(remaining) <= 1;
      const movement = Math.sign(remaining) * Math.max(1, Math.abs(remaining) * (1 - Math.exp(-delta / 90)));
      element.scrollTo({
        left: finished
          ? animation.target
          : element.scrollLeft + movement,
        behavior: "instant",
      });
      if (!finished) {
        animation.frame = requestAnimationFrame(animateWheel);
      } else {
        animation.frame = 0;
        animation.time = 0;
      }
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || !event.cancelable) return;
      const max = element.scrollWidth - element.clientWidth;
      // Vertical wheel input follows the reading order; horizontal gestures stay physical.
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      const delta = horizontal
        ? event.deltaX
        : direction * event.deltaY;
      if (!delta || max <= 1) return;
      const minLeft = rtl ? -max : 0;
      const maxLeft = rtl ? 0 : max;
      const animation = wheelMotion.current;
      const current = animation.frame ? animation.target : element.scrollLeft;
      // Release page scrolling only once both the target and the rail reach an edge.
      if ((delta < 0 && current <= minLeft + 1 && element.scrollLeft <= minLeft + 1) ||
        (delta > 0 && current >= maxLeft - 1 && element.scrollLeft >= maxLeft - 1)) return;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? parseFloat(getComputedStyle(element).lineHeight) || 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? element.clientWidth : 1;
      const left = Math.max(minLeft, Math.min(maxLeft, current + delta * unit));
      // At either end, let vertical scrolling continue through the page.
      if (left === element.scrollLeft) return;
      if (!horizontal && overview) {
        const bounds = overview.getBoundingClientRect();
        // Short windows retain natural page scrolling when the whole stage cannot fit.
        if (bounds.height > window.innerHeight + 1) return;
        const fullyVisible = bounds.top >= -1 && bounds.bottom <= window.innerHeight + 1;
        if (!fullyVisible) {
          alignViewportStage(overview, !motionEnabled.current);
          event.preventDefault();
          event.stopPropagation();
          stopWheelMotion();
          resetTilt();
          return;
        }
        // Stop page inertia at its current position while the rail moves;
        // realigning an already visible stage would introduce a vertical jump.
        scrollViewportTo(overview, window.scrollY, true);
      }
      // Keep Arabic trackpad gestures on the rail when page momentum is active.
      if (rtl && horizontal && overview) scrollViewportTo(overview, window.scrollY, true);
      event.preventDefault();
      event.stopPropagation();
      navigation.current = null;
      resetTilt();
      if (!motionEnabled.current) {
        stopWheelMotion();
        element.scrollTo({ left, behavior: "instant" });
        return;
      }
      // Accumulate input toward one target so fast wheel events keep their momentum.
      animation.target = left;
      if (!animation.frame) animation.frame = requestAnimationFrame(animateWheel);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(() => {
      stopWheelMotion();
      update();
    });
    observer.observe(element);
    const visibility = new IntersectionObserver(([entry]) => {
      if (overview) overview.dataset.inView = String(entry.isIntersecting);
    }, { threshold: 0.05 });
    if (overview) visibility.observe(overview);
    const syncMotion = () => {
      motionEnabled.current = getMotionPreference() === "enabled";
      if (!motionEnabled.current) {
        if (wheelMotion.current.frame) element.scrollTo({ left: wheelMotion.current.target, behavior: "instant" });
        stopWheelMotion();
        resetTilt();
      }
    };
    syncMotion();
    const unsubscribeMotion = subscribeMotionPreference(syncMotion);
    update();
    return () => {
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("scroll", update);
      observer.disconnect();
      visibility.disconnect();
      unsubscribeMotion();
      stopWheelMotion();
      if (overview) delete overview.dataset.inView;
    };
  }, [labels.length, direction, rtl]);

  return (
    <div className="service-rail" data-active-module={active} data-direction={rtl ? "rtl" : "ltr"}>
      <div className="service-rail-meta">
        <span className="service-rail-label">{locale === "ar" ? "إمكانات متصلة" : "CONNECTED CAPABILITIES"}</span>
        <span>{locale === "ar" ? "٦ وحدات / منصة واحدة" : "06 MODULES / ONE PLATFORM"}</span>
      </div>
      <div
        className="service-rail-viewport"
        id="service-rail"
        ref={viewport}
        dir={rtl ? "rtl" : "ltr"}
        role="region"
        aria-label={locale === "ar" ? "وحدات منصة سرج" : "SARJ platform modules"}
        tabIndex={0}
        data-lenis-prevent-horizontal
        onDragStart={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          moveTo(event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1 : active + (event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : -1));
        }}
        onPointerDown={(event) => {
          stopWheelMotion();
          navigation.current = null;
          resetTilt();
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          event.preventDefault();
          drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={(event) => {
          const gesture = drag.current;
          if (!gesture || !(event.buttons & 1)) {
            if (!motionEnabled.current || event.pointerType !== "mouse") return;
            const card = event.target instanceof Element ? event.target.closest<HTMLElement>(".service-card") : null;
            if (card !== tiltedCard.current) resetTilt();
            if (!card) return;
            tiltedCard.current = card;
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;
            card.style.setProperty("--card-pointer-x", `${x * 100}%`);
            card.style.setProperty("--card-pointer-y", `${y * 100}%`);
            card.style.setProperty("--card-rotate-x", `${(0.5 - y) * 5}deg`);
            card.style.setProperty("--card-rotate-y", `${(x - 0.5) * 5}deg`);
            return;
          }
          const distance = event.clientX - gesture.x;
          if (!gesture.moved && Math.abs(distance) > 6) {
            gesture.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.dataset.dragging = "true";
          }
          if (gesture.moved) {
            event.preventDefault();
            event.currentTarget.scrollTo({ left: gesture.scroll - distance, behavior: "instant" });
          }
        }}
        onPointerLeave={resetTilt}
        onPointerUp={(event) => {
          delete event.currentTarget.dataset.dragging;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          if (!drag.current?.moved) drag.current = null;
        }}
        onPointerCancel={(event) => { drag.current = null; delete event.currentTarget.dataset.dragging; }}
        onClickCapture={(event) => {
          if (drag.current?.moved) { event.preventDefault(); event.stopPropagation(); }
          drag.current = null;
        }}
      >
        {children}
      </div>
      <div className="service-rail-footer">
        <span className="service-rail-hint">{rtl ? <ArrowLeft size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}{hint}</span>
        <div className="service-rail-progress" ref={progress} aria-hidden="true"><span /></div>
        <div className="service-rail-controls" dir="ltr">
          <button type="button" aria-label={rtl ? next : previous} aria-controls="service-rail" onClick={() => moveTo(active + (rtl ? 1 : -1))} disabled={rtl ? active === labels.length - 1 : active === 0}><ArrowLeft size={18} aria-hidden="true" /></button>
          <span className="service-rail-count" aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(labels.length).padStart(2, "0")}</span>
          <button type="button" aria-label={rtl ? previous : next} aria-controls="service-rail" onClick={() => moveTo(active + (rtl ? -1 : 1))} disabled={rtl ? active === 0 : active === labels.length - 1}><ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="service-rail-shortcuts" role="group" aria-label={locale === "ar" ? "انتقل إلى وحدة" : "Jump to a module"}>
        {labels.map((label, index) => <button key={label} type="button" onClick={() => moveTo(index)} aria-label={`${goTo} ${label}`} aria-pressed={active === index}>{String(index + 1).padStart(2, "0")}<span>{label}</span></button>)}
      </div>
    </div>
  );
}
