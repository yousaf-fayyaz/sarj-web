"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getMotionPreference,
  getServerMotionPreference,
  subscribeMotionPreference,
  subscribeScrollFrame,
} from "@/lib/scroll-motion";
import styles from "./workspace-motion.module.css";

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
const groupedNumber = new Intl.NumberFormat("en-US");
const formatNumber = (value: number, grouped: boolean) =>
  (grouped ? groupedNumber.format(value || 0) : String(value)).replace("-", "−");

/** Reserve the final number's width and expose only that value to assistive tech. */
export function WorkspaceNumber({
  value,
  grouped = false,
  graphic,
}: {
  value: number;
  grouped?: boolean;
  graphic?: string;
}) {
  const formatted = formatNumber(value, grouped);
  return (
    <span className={styles.number}>
      <span className={styles.measure} aria-hidden="true">
        {formatted}
      </span>
      <span
        className={styles.value}
        aria-hidden="true"
        data-workspace-number={value}
        data-workspace-number-graphic={graphic}
        data-number-grouped={grouped ? "true" : undefined}
      >
        {formatted}
      </span>
      <span className="sr-only">{formatted}</span>
    </span>
  );
}

type Counter = {
  target: number;
  grouped: boolean;
  delay: number;
  animation: Animation;
};

type MotionElement = HTMLElement | SVGElement;
type Reveal = {
  delay: number;
  kind: "surface" | "detail" | "icon";
};

const detailSelector = [
  ":scope > span",
  ":scope > strong",
  ":scope > h4",
  ":scope > svg",
  ":scope > button",
  ":scope > div > h3",
  ":scope > div > p",
  ":scope > div > span",
  ":scope > div > strong",
  ":scope > div > small",
  ":scope > div > button",
  ".chart-heading > *",
  ".bar-column > span",
  ".chart-legend",
  ".donut",
  ".employee-name > .avatar",
  ".status > svg",
  ".workspace-date > svg",
  "[data-workspace-icon]",
].join(", ");

/** Visibility observers and the site's existing clock coordinate the dashboard. */
export function useWorkspaceMotion(view: string, approved: boolean, obscured = false) {
  const root = useRef<HTMLDivElement>(null);
  const entered = useRef(new WeakSet<Element>());
  const previousApproval = useRef(approved);
  const preference = useSyncExternalStore(
    subscribeMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );
  const enabled = preference === "enabled";
  const obscuredRef = useRef(obscured);
  const visibilitySync = useRef(new Set<() => void>());
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    // A dialog pauses existing timelines without rebuilding all observers and
    // rewriting the dashboard's animation attributes on each open/close.
    obscuredRef.current = obscured;
    visibilitySync.current.forEach(sync => sync());
  }, [obscured]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearby(true);
      observer.disconnect();
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element || !nearby) return;
    const panel = element.querySelector('[role="tabpanel"][data-state="active"]');
    const stages = [
      {
        selector: ".workspace-sidebar > .brand, .workspace-team, .workspace-sidebar > .micro",
        delay: 0,
        stagger: 35,
      },
      { selector: ".workspace-nav-item", delay: 60, stagger: 35 },
      { selector: ".workspace-topbar", delay: 40, stagger: 0 },
      { selector: ".workspace-greeting", delay: 100, stagger: 0 },
      { selector: ".workspace-stats > div", delay: 160, stagger: 65 },
      { selector: ".attendance-chart, .attendance-ring", delay: 280, stagger: 80 },
      { selector: "[data-workspace-card]", delay: 220, stagger: 70 },
      { selector: ".sample-table-title, .sample-row-head", delay: 320, stagger: 35 },
      {
        selector: ".sample-row:not(.sample-row-head)",
        delay: 380,
        stagger: 55,
      },
      {
        selector: ".leave-balance, .payroll-cycle, .performance-title",
        delay: 140,
        stagger: 0,
      },
      {
        selector: ".payroll-ledger > div, .performance-row, .document-row",
        delay: 200,
        stagger: 65,
      },
      {
        selector: ".workspace-note, .workspace-sidebar-footer, .workspace-disclaimer",
        delay: 180,
        stagger: 35,
      },
      {
        selector: ".workspace-content .content-rail-controls",
        delay: 280,
        stagger: 0,
      },
    ];
    const targets = new Map<MotionElement, Reveal>();
    const compact = matchMedia("(max-width: 767px)").matches;
    for (const stage of stages) {
      element
        .querySelectorAll<MotionElement>(stage.selector)
        .forEach((target, i) => {
          if (!entered.current.has(target))
            targets.set(target, {
              delay: stage.delay + i * stage.stagger,
              kind: "surface",
            });
        });
    }
    // Give each piece of tab content its own entrance, after its containing card.
    for (const [surface, reveal] of Array.from(targets)) {
      // Compact screens animate each surface and its charts as a unit.
      if (compact) continue;
      if (!panel?.contains(surface) && !surface.matches(".workspace-greeting"))
        continue;
      surface.querySelectorAll<MotionElement>(detailSelector).forEach((detail, i) => {
        // Progress graphics have their own scale animation below.
        if (detail.matches(".performance-track > span, .bar-track > span")) return;
        targets.set(detail, {
          delay: Math.min(reveal.delay + 60 + i * 35, 600),
          kind: detail.matches("svg, .avatar, [data-workspace-icon]") ? "icon" : "detail",
        });
      });
    }
    if (
      !enabled ||
      getMotionPreference() !== "enabled" ||
      !window.IntersectionObserver ||
      !element.animate
    ) {
      targets.forEach((_, target) => entered.current.add(target));
      return;
    }

    const played = entered.current;
    const animations = new Map<Animation, Element>();
    const counters = new Map<HTMLElement, Counter>();
    const animatedValues = new Set<Element>();
    let unsubscribeClock: (() => void) | undefined;
    let disposed = false;

    const animate = (
      target: Element,
      frames: Keyframe[],
      duration: number,
      delay: number,
    ) => {
      const animation = target.animate(frames, {
        duration,
        delay,
        easing: ease,
        fill: "both",
      });
      animations.set(animation, target);
      animation.onfinish = () => {
        // Static CSS owns the final state; don't retain filled compositor layers.
        animation.cancel();
        animations.delete(animation);
      };
      return animation;
    };
    const settleCounter = (target: HTMLElement) => {
      const counter = counters.get(target);
      if (counter) {
        counter.animation.cancel();
        animations.delete(counter.animation);
      }
      target.textContent = formatNumber(
        Number(target.dataset.workspaceNumber),
        target.dataset.numberGrouped === "true",
      );
      counters.delete(target);
    };
    const stopClockWhenIdle = () => {
      if (counters.size) return;
      unsubscribeClock?.();
      unsubscribeClock = undefined;
    };
    const count = (target: HTMLElement, delay: number) => {
      // Linked values follow their graphic instead of an independent counter.
      if (target.dataset.workspaceNumberGraphic) return;
      // Cards and their details share values; each value needs just one timeline.
      if (animatedValues.has(target)) return;
      animatedValues.add(target);
      // The native timeline keeps counts aligned with charts even when a frame drops.
      const animation = animate(target, [], 760, delay);
      counters.set(target, {
        target: Number(target.dataset.workspaceNumber),
        grouped: target.dataset.numberGrouped === "true",
        delay,
        animation,
      });
      animation.onfinish = () => {
        settleCounter(target);
        stopClockWhenIdle();
      };
      target.textContent = "0";
      if (unsubscribeClock) return;
      unsubscribeClock = subscribeScrollFrame((frame) => {
        if (disposed || !frame.enabled) return;
        for (const [number, counter] of counters) {
          if (Number(number.dataset.workspaceNumber) !== counter.target) {
            settleCounter(number);
            continue;
          }
          const elapsed = counter.animation.currentTime;
          const activeTime = (typeof elapsed === "number" ? elapsed : 0) - counter.delay;
          const progress = Math.max(
            0,
            Math.min(1, activeTime / 760),
          );
          const value = Math.round(
            counter.target * (1 - (1 - progress) ** 3),
          );
          const formatted = formatNumber(value, counter.grouped);
          if (number.textContent !== formatted) number.textContent = formatted;
          if (progress === 1) settleCounter(number);
        }
        stopClockWhenIdle();
      });
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || disposed || document.hidden || obscuredRef.current) continue;
        const target = entry.target as MotionElement;
        const { delay, kind } = targets.get(target)!;
        observer.unobserve(target);
        played.add(target);
        animate(
          target,
          kind === "icon"
            ? [
                { opacity: 0, transform: "scale(0.8) rotate(-6deg)" },
                { opacity: 1, transform: "scale(1.06) rotate(0)", offset: 0.7 },
                { opacity: 1, transform: "scale(1) rotate(0)" },
              ]
            : [
                {
                  opacity: 0,
                  transform: `translateY(${kind === "surface" ? 14 : 6}px)`,
                },
                { opacity: 1, transform: "translateY(0)" },
              ],
          kind === "surface" ? 480 : 360,
          delay,
        );
        delete target.dataset.workspaceReveal;
        target.dataset.workspaceRevealed = "true";
        target.style.setProperty("--workspace-reveal-delay", `${delay}ms`);
        target
          .querySelectorAll<HTMLElement>("[data-workspace-number]")
          .forEach((number) => count(number, delay + 60));
        target
          .querySelectorAll<HTMLElement>(".bar-track > span")
          .forEach((bar, i) => {
            if (animatedValues.has(bar)) return;
            animatedValues.add(bar);
            animate(
              bar,
              [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
              820,
              delay + 90 + Math.floor(i / 2) * 60 + (i % 2) * 30,
            );
          });
        target
          .querySelectorAll<HTMLElement>(".performance-track > span")
          .forEach((bar) => {
            if (animatedValues.has(bar)) return;
            animatedValues.add(bar);
            animate(
              bar,
              [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
              820,
              delay + 80,
            );
          });
        target
          .querySelectorAll<SVGCircleElement>("[data-workspace-ring]")
          .forEach((ring) => {
            if (animatedValues.has(ring)) return;
            animatedValues.add(ring);
            animate(
              ring,
              [
                { strokeDashoffset: ring.dataset.workspaceRing || "93" },
                { strokeDashoffset: "0" },
              ],
              950,
              delay + 80,
            );
          });
        target
          .querySelectorAll<SVGPathElement>("[data-workspace-chart-line]")
          .forEach((line) => {
            if (animatedValues.has(line)) return;
            animatedValues.add(line);
            animate(
              line,
              [{ strokeDashoffset: "100" }, { strokeDashoffset: "0" }],
              900,
              delay + 80,
            );
          });
        target
          .querySelectorAll<SVGRectElement>("[data-workspace-chart-bar]")
          .forEach((bar, i) => {
            if (animatedValues.has(bar)) return;
            animatedValues.add(bar);
            animate(
              bar,
              [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
              820,
              delay + 80 + i * 70,
            );
          });
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    targets.forEach((_, target) => {
      // Enhancement only: server-rendered values remain complete without JavaScript.
      target.dataset.workspaceReveal = "pending";
      target.dataset.workspaceAnimation = targets.get(target)!.kind;
      observer.observe(target);
    });
    const settleRunning = (within?: Element) => {
      for (const [animation, target] of animations) {
        if (within && !within.contains(target)) continue;
        animation.cancel();
        animations.delete(animation);
      }
      for (const number of counters.keys()) {
        if (!within || within.contains(number)) settleCounter(number);
      }
      stopClockWhenIdle();
    };
    const revealFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      // Keyboard focus reveals immediately. Pointer focus must not move the
      // clicked control between mousedown and mouseup.
      if (!event.target.matches(":focus-visible")) return;
      for (const target of targets.keys()) {
        if (!target.contains(event.target)) continue;
        observer.unobserve(target);
        played.add(target);
        delete target.dataset.workspaceReveal;
        settleRunning(target);
      }
    };
    const visibility = () => {
      const hidden = document.hidden || obscuredRef.current;
      for (const animation of animations.keys()) {
        if (hidden) animation.pause();
        else animation.play();
      }
      if (!hidden) {
        targets.forEach((_, target) => {
          if (!played.has(target)) {
            observer.unobserve(target);
            observer.observe(target);
          }
        });
      }
    };
    const viewportObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) settleRunning();
    });
    viewportObserver.observe(element);
    element.addEventListener("focusin", revealFocus);
    document.addEventListener("visibilitychange", visibility);
    const syncListeners = visibilitySync.current;
    syncListeners.add(visibility);
    return () => {
      disposed = true;
      observer.disconnect();
      viewportObserver.disconnect();
      settleRunning();
      targets.forEach((_, target) => {
        delete target.dataset.workspaceReveal;
        delete target.dataset.workspaceRevealed;
        delete target.dataset.workspaceAnimation;
        target.style.removeProperty("--workspace-reveal-delay");
      });
      element.removeEventListener("focusin", revealFocus);
      document.removeEventListener("visibilitychange", visibility);
      syncListeners.delete(visibility);
    };
  }, [view, enabled, nearby]);

  useEffect(() => {
    const element = root.current;
    if (
      !element ||
      !nearby ||
      !enabled ||
      getMotionPreference() !== "enabled" ||
      !window.IntersectionObserver
    ) {
      return;
    }

    const panels = element.querySelectorAll<HTMLElement>(
      ".workspace-stats > div, .attendance-chart, .attendance-ring, .performance-row, " +
      ".sample-row:not(.sample-row-head), .document-row, .payroll-ledger > div, " +
      ".leave-balance, .payroll-cycle, .performance-title, .workspace-note, " +
      ".workspace-sidebar-footer, [data-workspace-card]",
    );
    const graphicNumbers = Array.from(
      element.querySelectorAll<HTMLElement>("[data-workspace-number-graphic]"),
    ).flatMap((number) => {
      const id = number.dataset.workspaceNumberGraphic;
      if (!id) return [];
      const graphic = element.querySelector<MotionElement>(
        `[data-workspace-graphic="${CSS.escape(id)}"]`,
      );
      const card = graphic?.closest<HTMLElement>(
        ".performance-row, .attendance-ring, [data-workspace-card]",
      );
      if (!graphic || !card) return [];
      return [{
        graphic,
        number,
        card,
        target: Number(number.dataset.workspaceNumber),
        grouped: number.dataset.numberGrouped === "true",
      }];
    });
    const visible = new Set<HTMLElement>();
    const sync = (panel: HTMLElement) => {
      panel.dataset.workspaceAmbient =
        visible.has(panel) && !document.hidden && !obscuredRef.current ? "running" : "paused";
    };
    const syncGraphicNumbers = () => {
      if (document.hidden || obscuredRef.current) return;
      const progressByGraphic = new Map<MotionElement, number>();
      const updates: { number: HTMLElement; formatted: string }[] = [];
      for (const { graphic, number, card, target, grouped } of graphicNumbers) {
        if (!visible.has(card)) continue;
        let progress = progressByGraphic.get(graphic);
        if (progress === undefined) {
          // The rendered stroke or transform is the shared source of progress.
          const style = getComputedStyle(graphic);
          if (graphic.hasAttribute("data-workspace-ring")) {
            const total = Number(graphic.dataset.workspaceRing);
            const offset = parseFloat(style.strokeDashoffset);
            progress = total > 0 ? (total - offset) / total : 1;
          } else {
            const matrix = style.transform === "none"
              ? null
              : new DOMMatrixReadOnly(style.transform);
            progress = matrix ? Math.hypot(matrix.a, matrix.b) : 1;
          }
          if (!Number.isFinite(progress)) continue;
          progress = Math.max(0, Math.min(1, progress));
          progressByGraphic.set(graphic, progress);
        }
        updates.push({ number, formatted: formatNumber(Math.round(target * progress), grouped) });
      }
      // Finish style reads before changing text, whose width is already reserved.
      for (const { number, formatted } of updates) {
        if (number.textContent !== formatted) number.textContent = formatted;
      }
    };
    panels.forEach((panel, i) => {
      panel.dataset.workspaceAmbient = "paused";
      panel.style.setProperty(
        "--workspace-loop-delay",
        `${1600 + (i % 4) * 650}ms`,
      );
      panel
        .querySelectorAll<HTMLElement>(".bar-track > span")
        .forEach((bar, index) => {
          bar.style.setProperty(
            "--workspace-bar-delay",
            `${1600 + index * 160}ms`,
          );
        });
    });
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const panel = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(panel);
        else visible.delete(panel);
        sync(panel);
      }
      syncGraphicNumbers();
    }, { threshold: 0.05 });
    panels.forEach((panel) => observer.observe(panel));
    const unsubscribeGraphicClock = graphicNumbers.length
      ? subscribeScrollFrame((frame) => {
          if (frame.enabled) syncGraphicNumbers();
        })
      : undefined;
    const visibility = () => panels.forEach(sync);
    document.addEventListener("visibilitychange", visibility);
    const syncListeners = visibilitySync.current;
    syncListeners.add(visibility);
    return () => {
      observer.disconnect();
      unsubscribeGraphicClock?.();
      document.removeEventListener("visibilitychange", visibility);
      syncListeners.delete(visibility);
      graphicNumbers.forEach(({ number, target, grouped }) => {
        number.textContent = formatNumber(target, grouped);
      });
      panels.forEach((panel) => {
        delete panel.dataset.workspaceAmbient;
        panel.style.removeProperty("--workspace-loop-delay");
        panel.querySelectorAll<HTMLElement>(".bar-track > span").forEach((bar) => {
          bar.style.removeProperty("--workspace-bar-delay");
        });
      });
    };
  }, [view, enabled, nearby]);

  useEffect(() => {
    if (previousApproval.current === approved) return;
    previousApproval.current = approved;
    const element = root.current;
    if (
      !element ||
      !enabled ||
      getMotionPreference() !== "enabled" ||
      !element.animate
    ) {
      return;
    }
    const animations: Animation[] = [];
    element.querySelectorAll<HTMLElement>(
      '[data-workspace-update], [data-workspace-request="sample"] > .status, .workspace-disclaimer [aria-live]',
    ).forEach((target, i) => {
      const animation = target.animate(
        [
          { opacity: 0.55, transform: "translateY(5px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 360, delay: i * 35, easing: ease },
      );
      animations.push(animation);
      animation.onfinish = () => animation.cancel();
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [approved, enabled]);

  return { ref: root, enabled: enabled && !obscured };
}
