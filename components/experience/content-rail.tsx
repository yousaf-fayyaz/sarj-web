"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getMotionPreference } from "@/lib/scroll-motion";
import type { Locale } from "@/lib/content";

function cardScrollLeft(element: HTMLElement, card: HTMLElement, rtl: boolean) {
  const first = element.firstElementChild;
  if (!(first instanceof HTMLElement)) return 0;
  // Layout offsets stay stable while the containing card tilts or scales.
  const offset = card.offsetLeft - first.offsetLeft +
    (rtl ? card.offsetWidth - first.offsetWidth : 0);
  const max = Math.max(0, element.scrollWidth - element.clientWidth);
  return rtl ? Math.max(-max, Math.min(0, offset)) : Math.max(0, Math.min(max, offset));
}

/** Native swiping keeps a complete card in view on compact screens. */
export function ContentRail({
  children,
  className,
  label,
  locale = "en",
}: {
  children: ReactNode;
  className: string;
  label: string;
  locale?: Locale;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const count = Math.max(1, Children.toArray(children).length);
  const rtl = locale === "ar";

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let visible = false;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!visible) return;
      const cards = Array.from(element.children) as HTMLElement[];
      let closest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const offset = Math.abs(element.scrollLeft - cardScrollLeft(element, card, rtl));
        if (offset < distance) {
          closest = index;
          distance = offset;
        }
      });
      setPage(closest);
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(measure);
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { rootMargin: "300px" });
    visibility.observe(element);
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    element.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      observer.disconnect();
      element.removeEventListener("scroll", schedule);
    };
  }, [rtl, count]);

  const moveTo = (index: number) => {
    const element = track.current;
    const card = element?.children[index];
    if (!element || !(card instanceof HTMLElement)) return;
    element.scrollTo({
      left: cardScrollLeft(element, card, rtl),
      behavior: getMotionPreference() === "enabled" ? "smooth" : "instant",
    });
  };

  return (
    <div className="content-rail">
      <div
        className={`content-rail-track ${className}`}
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        data-native-rail
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
          )
            return;
          event.preventDefault();
          const direction =
            event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : -1;
          moveTo(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? count - 1
                : Math.max(0, Math.min(count - 1, page + direction)),
          );
        }}
      >
        {children}
      </div>
      <div className="content-rail-controls">
        <span>{rtl ? "اسحب للاستكشاف" : "Swipe to explore"}</span>
        <div>
          <button
            type="button"
            disabled={page === 0}
            aria-label={rtl ? "البطاقة السابقة" : "Previous card"}
            onClick={() => moveTo(page - 1)}
          >
            {rtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
          <span aria-live="polite" dir="ltr">
            {page + 1} / {count}
          </span>
          <button
            type="button"
            disabled={page === count - 1}
            aria-label={rtl ? "البطاقة التالية" : "Next card"}
            onClick={() => moveTo(page + 1)}
          >
            {rtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
