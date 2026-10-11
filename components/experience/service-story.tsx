"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowUpRight, Check, FileText, Smartphone } from "lucide-react";
import { getMotionPreference, subscribeMotionPreference, subscribeScrollFrame } from "@/lib/scroll-motion";
import type { Locale, SiteContent } from "@/lib/content";
import { moduleSubjects } from "@/lib/module-shapes";
import { createWheelGestureTracker } from "@/lib/wheel-gesture";
import { scrollViewportTo } from "@/lib/viewport-navigation";
import { ContentRail } from "./content-rail";
import { ModuleLineArt } from "./module-line-art";
import styles from "./service-story.module.css";

const words = {
  en: {
    eyebrow: "SARJ / WORKFLOWS", title: "Daily HR.", second: "Step by step.",
    description: "See how each module supports everyday tasks.",
    hint: "EXPLORE THE WORKFLOWS", sample: "ILLUSTRATIVE WORKFLOW", connected: "In your workspace",
    previews: ["Payroll workflow", "Shift tracking", "Leave approvals", "Mobile self-service", "Performance reviews", "Document archive"],
    payroll: ["Basic salary", "Allowances", "Deductions", "Electronic approval", "WPS transfer"],
    attendance: ["Check-in", "Shift", "Overtime"], leave: ["REQUEST", "REVIEW", "APPROVAL"],
    requests: ["Leave request", "Employee records", "Payslips"], performance: ["GOALS", "REVIEW", "PROGRESS"],
    files: ["Employment contract", "Iqama document", "Employee information"], available: "Available in one place",
  },
  ar: {
    eyebrow: "سرج / مسارات العمل", title: "مهام يومية.", second: "خطوة بخطوة.",
    description: "شاهد كيف تدعم كل وحدة مهامك اليومية.",
    hint: "استكشف مسارات العمل", sample: "مسار عمل توضيحي", connected: "في مساحة عملك",
    previews: ["دورة الرواتب", "متابعة الورديات", "اعتماد الإجازات", "الخدمة الذاتية من الجوال", "تقييم الأداء", "أرشيف الوثائق"],
    payroll: ["الراتب الأساسي", "البدلات", "الخصومات", "اعتماد إلكتروني", "تحويل الأجور"],
    attendance: ["تسجيل الحضور", "الوردية", "العمل الإضافي"], leave: ["طلب", "مراجعة", "اعتماد"],
    requests: ["طلب إجازة", "سجلات الموظف", "قسائم الرواتب"], performance: ["الأهداف", "التقييم", "التقدّم"],
    files: ["عقد العمل", "وثيقة الإقامة", "معلومات الموظف"], available: "متاحة في مكان واحد",
  },
};

function WorkflowVisual({ index, locale }: { index: number; locale: Locale }) {
  const w = words[locale];
  return (
    <div className={`workflow-visual workflow-visual-${index}`}>
      <div className="workflow-visual-top"><span>{w.sample}</span><span aria-hidden="true">0{index + 1}</span></div>
      <h4>{w.previews[index]}</h4>
      <ModuleLineArt subject={moduleSubjects[index]} index={index} />
      {index === 0 ? <div className="payroll-ledger">
        {w.payroll.slice(0, 3).map((label, i) => <div className="ledger-row" key={label}><span>{label}</span><span className={`ledger-mark ledger-mark-${i}`} aria-hidden="true" /></div>)}
        <div className="ledger-route"><span><Check size={13} aria-hidden="true" />{w.payroll[3]}</span><span>{w.payroll[4]}<ArrowUpRight size={13} aria-hidden="true" /></span></div>
      </div> : null}
      {index === 1 ? <div className="attendance-timeline">
        <div className="timeline-ruler" aria-hidden="true">{["08:00", "12:00", "16:00"].map(time => <span key={time}>{time}</span>)}</div>
        {w.attendance.map((label, i) => <div className={`timeline-row timeline-row-${i}`} key={label}><span>{label}</span><div><i /><b /></div></div>)}
      </div> : null}
      {index === 2 ? <div className="leave-calendar">
        <div className="calendar-grid" aria-hidden="true">{Array.from({ length: 28 }, (_, day) => <span key={day} className={day >= 10 && day <= 14 ? "calendar-selected" : ""}>{String(day + 1).padStart(2, "0")}</span>)}</div>
        <div className="approval-route">{w.leave.map(label => <span key={label}>{label}</span>)}</div>
      </div> : null}
      {index === 3 ? <div className="request-hub">
        <div className="request-hub-identity"><Smartphone size={23} strokeWidth={1.2} aria-hidden="true" /><span>{w.available}</span></div>
        {w.requests.map(label => <div className="request-hub-row" key={label}><span>{label}</span><ArrowUpRight size={15} aria-hidden="true" /></div>)}
      </div> : null}
      {index === 4 ? <div className="performance-graph">
        <svg viewBox="0 0 300 160" fill="none" aria-hidden="true">
          {[30, 65, 100, 135].map(y => <path key={y} d={`M0 ${y}h300`} stroke="currentColor" strokeOpacity=".12" />)}
          <path d="M0 140C35 140 30 110 70 110S105 72 145 77s42-42 78-39 48-28 77-28" className="graph-trace" pathLength="100" />
          <path d="M0 140C35 140 30 110 70 110S105 72 145 77s42-42 78-39 48-28 77-28" className="graph-signal" pathLength="100" />
          {[ [70,110], [145,77], [223,38] ].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" fill="currentColor" />)}
        </svg>
        <div className="graph-legend">{w.performance.map(label => <span key={label}>{label}</span>)}</div>
      </div> : null}
      {index === 5 ? <div className="document-archive">
        {w.files.map((label, i) => <div className={`document-row document-row-${i}`} key={label}><FileText size={20} strokeWidth={1.2} aria-hidden="true" /><span>{label}<i aria-hidden="true" /></span><Check size={13} aria-hidden="true" /></div>)}
      </div> : null}
      <div className="workflow-visual-footer"><span className="connection-dot" aria-hidden="true" />{w.connected}</div>
    </div>
  );
}

function resetCardPointer(panel: HTMLElement) {
  const visual = panel.querySelector<HTMLElement>(".workflow-visual");
  for (const card of [panel, visual]) {
    if (!card) continue;
    for (const property of ["--card-rotate-x", "--card-rotate-y", "--card-pointer-x", "--card-pointer-y"]) {
      card.style.removeProperty(property);
    }
  }
}

export function ServiceStory({ items, locale, explore }: { items: SiteContent["features"]["items"]; locale: Locale; explore: string }) {
  const section = useRef<HTMLDivElement>(null);
  const motionEnabled = useRef(true);
  const [active, setActive] = useState(0);
  const [nearby, setNearby] = useState(false);
  const w = words[locale];

  function updateCardPointer(event: PointerEvent<HTMLElement>) {
    if (!motionEnabled.current || event.pointerType !== "mouse" || event.buttons) return;
    const panel = event.currentTarget;
    const visual = panel.querySelector<HTMLElement>(".workflow-visual");
    for (const card of [panel, visual]) {
      if (!card) continue;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      card.style.setProperty("--card-pointer-x", `${x * 100}%`);
      card.style.setProperty("--card-pointer-y", `${y * 100}%`);
      if (card === panel) {
        card.style.setProperty("--card-rotate-x", `${(0.5 - y) * 5}deg`);
        card.style.setProperty("--card-rotate-y", `${(x - 0.5) * 5}deg`);
      }
    }
  }

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setNearby(true);
      observer.disconnect();
    }, { rootMargin: "700px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element || !nearby) return;
    const panels = Array.from(element.querySelectorAll<HTMLElement>(".service-story-panel"));
    const markers = Array.from(element.querySelectorAll<HTMLElement>(".service-story-marker"));
    let positions: { top: number; height: number }[] = [];
    let current = 0;
    let visible = false;
    let pin = 100;
    let pinned = false;
    let held = false;
    let allowExit = false;
    let exitGestures = 0;
    let lastWheel = -Infinity;
    let wheelDirection = 0;
    let previousScroll = window.scrollY;
    const freshGesture = createWheelGestureTracker();
    const endPosition = () => Math.max(0, (positions.at(-1)?.top ?? 0) - pin);
    const resetHandoff = () => {
      held = false;
      allowExit = false;
      exitGestures = 0;
      wheelDirection = 0;
      delete element.dataset.scrollHandoff;
    };
    const holdLastCard = () => {
      const firstHold = !held;
      if (firstHold) {
        exitGestures = 0;
        element.dataset.scrollHandoff = "held";
      }
      held = true;
      if (firstHold || Math.abs(window.scrollY - endPosition()) > 1) {
        scrollViewportTo(element, endPosition(), true);
      }
    };
    const measure = () => {
      const previousEnd = endPosition();
      const wasPinned = pinned;
      positions = panels.map((panel, i) => ({ top: markers[i].getBoundingClientRect().top + window.scrollY, height: panel.offsetHeight }));
      const style = getComputedStyle(panels[0]);
      pin = parseFloat(style.top) || 100;
      pinned = style.position === "sticky" && panels.at(-1)!.offsetHeight + pin <= innerHeight;
      // Repeated observer notifications must not release a held final card.
      if (wasPinned !== pinned || Math.abs(previousEnd - endPosition()) > 2) resetHandoff();
    };
    const wheel = (event: WheelEvent) => {
      if (!pinned || !visible || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey
        || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const fresh = freshGesture(event);
      lastWheel = performance.now();
      wheelDirection = Math.sign(event.deltaY);
      if (wheelDirection < 0) { resetHandoff(); return; }
      const end = endPosition();
      if (fresh && held) exitGestures += 1;
      if (fresh && ((held && exitGestures >= 2) || (!held && window.scrollY >= end - 1))) {
        held = false;
        allowExit = true;
        delete element.dataset.scrollHandoff;
      }
      if (window.scrollY < end - 1) allowExit = false;
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? innerHeight : 1;
      const reachingEnd = !allowExit && window.scrollY < end - 1
        && window.scrollY + event.deltaY * unit >= end;
      if (held || reachingEnd) {
        event.preventDefault();
        event.stopPropagation();
        holdLastCard();
      }
    };
    // Capture before Lenis: after reaching card six, two fresh gestures release it.
    window.addEventListener("wheel", wheel, { passive: false, capture: true });
    window.addEventListener("pointerdown", resetHandoff, { passive: true });
    window.addEventListener("keydown", resetHandoff);
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const intersection = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === element) visible = entry.isIntersecting;
        else (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting);
      }
    }, { rootMargin: "100px" });
    intersection.observe(element);
    panels.forEach(panel => intersection.observe(panel));
    const syncMotion = () => {
      motionEnabled.current = getMotionPreference() === "enabled";
      if (!motionEnabled.current) panels.forEach(resetCardPointer);
    };
    syncMotion();
    const unsubscribeMotion = subscribeMotionPreference(syncMotion);
    measure();
    const unsubscribe = subscribeScrollFrame(frame => {
      // A smoothed wheel target can cross the boundary between input events.
      if (pinned && !allowExit && wheelDirection > 0 && performance.now() - lastWheel < 1000
        && previousScroll < endPosition() && frame.scroll >= endPosition()) holdLastCard();
      previousScroll = held ? endPosition() : frame.scroll;
      if (!visible || !positions.length) return;
      let chapter = 0;
      positions.forEach(({ top, height }, i) => {
        if (top - frame.scroll <= pin + 70) chapter = i;
        const next = positions[i + 1];
        const stack = next ? Math.min(1, Math.max(0, (frame.scroll + pin + height - next.top) / Math.max(height, 1))) : 0;
        const storyDistance = innerWidth >= 1200 ? frame.scroll + pin - top + height * .18 : frame.scroll + innerHeight * .72 - top;
        const storyDuration = innerWidth >= 1200 && next ? next.top - top : height;
        const story = Math.min(1, Math.max(0, storyDistance / Math.max(storyDuration, 1)));
        panels[i].style.setProperty("--stack-progress", frame.enabled && !frame.compact ? stack.toFixed(3) : "0");
        panels[i].style.setProperty("--story-progress", frame.enabled ? story.toFixed(3) : "1");
      });
      if (current !== chapter) { current = chapter; setActive(chapter); }
    });
    return () => {
      unsubscribe();
      unsubscribeMotion();
      resize.disconnect();
      intersection.disconnect();
      window.removeEventListener("wheel", wheel, true);
      window.removeEventListener("pointerdown", resetHandoff);
      window.removeEventListener("keydown", resetHandoff);
      delete element.dataset.scrollHandoff;
      panels.forEach(panel => { resetCardPointer(panel); delete panel.dataset.inView; });
    };
  }, [nearby]);

  return (
    <div className={`${styles.story} service-story`} ref={section} id="workflows">
      <div className="service-story-sidebar viewport-stage" data-viewport-stage>
        <span className="eyebrow"><span aria-hidden="true" />{w.eyebrow}</span>
        <h2>{w.title}<br /><span>{w.second}</span></h2>
        <p>{w.description}</p>
        <nav className="service-story-nav" aria-label={locale === "ar" ? "استكشف مسارات العمل" : "Explore service workflows"}>
          {items.map((item, i) => <a key={item.label} href={`#module-${i + 1}`} aria-current={active === i ? "step" : undefined}><span>0{i + 1}</span>{item.chapter}<ArrowUpRight size={14} aria-hidden="true" /></a>)}
        </nav>
        <span className="service-story-scroll-hint">{w.hint}<span aria-hidden="true" /></span>
      </div>
      <div className="service-story-stack">
        {items.map((item, i) => <Fragment key={item.label}><div className="service-story-marker" id={`module-${i + 1}`} aria-hidden="true" data-viewport-stage /><article
          aria-labelledby={`service-story-title-${i + 1}`}
          className={`${styles.panel} service-story-panel service-story-panel-${i}`}
          data-in-view="false"
          style={{ "--panel-index": i, "--signal-delay": `${i * -0.7}s` } as CSSProperties}
          onPointerMove={updateCardPointer}
          onPointerDown={event => resetCardPointer(event.currentTarget)}
          onPointerLeave={event => resetCardPointer(event.currentTarget)}
          onPointerCancel={event => resetCardPointer(event.currentTarget)}
        >
          <div className="service-story-panel-heading"><span>{item.label}</span><span>0{i + 1} / 06</span></div>
          <ContentRail className="service-story-panel-body" label={item.title} locale={locale}>
            <div className="service-story-copy">
              <h3 id={`service-story-title-${i + 1}`}>{item.title}</h3>
              <p>{item.description}</p>
              <ul>{item.details.map(detail => <li key={detail}><Check size={13} aria-hidden="true" />{detail}</li>)}</ul>
              <a href="#workspace-intro" className="service-story-action">{explore}<ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
            <WorkflowVisual index={i} locale={locale} />
          </ContentRail>
        </article></Fragment>)}
      </div>
    </div>
  );
}
