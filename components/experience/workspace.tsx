"use client";

import { startTransition, useCallback, useId, useRef, useState, useSyncExternalStore } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Files,
  LayoutDashboard,
  MousePointer2,
  Search,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { type Locale, type SiteContent } from "@/lib/content";
import { Eyebrow, Action } from "./sections";
import { useWorkspaceMotion } from "./workspace-motion";
import { WorkspaceDashboard } from "./workspace-dashboard";
import motionStyles from "./workspace-motion.module.css";

const navigation = [
  "dashboard",
  "attendance",
  "leave",
  "payroll",
  "performance",
  "files",
] as const;
type View = (typeof navigation)[number];
const icons = [
  LayoutDashboard,
  Clock3,
  CalendarDays,
  Wallet,
  TrendingUp,
  Files,
];

function subscribeToViewport(callback: () => void) {
  const media = window.matchMedia("(max-width: 767px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getMobileViewport = () => window.matchMedia("(max-width: 767px)").matches;
const getServerViewport = () => false;

export function Workspace({
  copy: c,
  locale,
  demo,
  description,
}: {
  copy: SiteContent["preview"];
  locale: Locale;
  demo: string;
  description: string;
}) {
  const [view, setView] = useState<View>("dashboard");
  const [approved, setApproved] = useState(false);
  const [dialog, setDialog] = useState(false);
  const navigationHintId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const reviewTrigger = useRef<HTMLElement | null>(null);
  const openReview = useCallback(() => {
    reviewTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDialog(true);
  }, []);
  const { ref: workspaceRef, enabled: motionEnabled } = useWorkspaceMotion(
    view,
    approved,
    dialog,
  );
  const mobile = useSyncExternalStore(
    subscribeToViewport,
    getMobileViewport,
    getServerViewport,
  );
  const ar = locale === "ar";
  const text = (en: string, arabic: string) => (ar ? arabic : en);
  const descriptions: Record<View, string> = {
    dashboard: c.subtitle,
    attendance: c.attendanceDescription,
    leave: c.leaveDescription,
    payroll: c.payrollDescription,
    performance: c.performanceDescription,
    files: c.filesDescription,
  };
  const changeView = (value: string) => {
    startTransition(() => setView(value as View));
    contentRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  return (
    <section className="workspace-section container" id="workspace-intro">
      <div className="workspace-panel">
        <div className="workspace-introduction">
          <div className="section-heading split" data-reveal>
            <div>
              <Eyebrow>{c.label}</Eyebrow>
              <h2>{c.title}</h2>
              <div className="action-group">
                <Action href="#contact">{demo}</Action>
                <a className="text-link" href="#workspace-preview">
                  {text("Try the sample workspace", "جرّب مساحة العمل التوضيحية")}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              </div>
            </div>
            <p>{description}</p>
          </div>
        </div>
        <div
          className="workspace-preview viewport-stage"
          id="workspace-preview"
          data-viewport-stage
        >
          <Tabs.Root
            className={`workspace-app ${motionStyles.motion}`}
            ref={workspaceRef}
            data-workspace-motion={motionEnabled ? "enabled" : "paused"}
            value={view}
            onValueChange={changeView}
            orientation={mobile ? "horizontal" : "vertical"}
            dir={ar ? "rtl" : "ltr"}
          >
            <aside className="workspace-sidebar">
              <Brand />
              <div className="workspace-team">
                <span className="workspace-team-avatar">S</span>
                <span>
                  SARJ <small>{c.sidebar}</small>
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </div>
              <span className="micro">{c.sidebar}</span>
              <p className={motionStyles.navHint} id={navigationHintId}>
                <MousePointer2 size={13} aria-hidden="true" />
                {text("Select a module to explore", "اختر قسمًا لاستكشافه")}
              </p>
              <Tabs.List
                className="workspace-navigation"
                aria-label={c.sidebar}
                aria-describedby={navigationHintId}
              >
                {navigation.map((item, i) => {
                  const Icon = icons[i];
                  return (
                    <Tabs.Trigger
                      key={item}
                      value={item}
                      className="workspace-nav-item"
                    >
                      <Icon size={17} aria-hidden="true" />
                      <span className={motionStyles.navLabel}>{c[item]}</span>
                      {item === "leave" ? (
                        <span
                          className="nav-count"
                          data-workspace-update="badge"
                        >
                          {approved ? "4" : "5"}
                        </span>
                      ) : null}
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>
              <div className="workspace-sidebar-footer">
                <span className="connection-dot" />
                {c.connected}
              </div>
            </aside>
            <div className="workspace-main">
              <div className="workspace-topbar">
                <span title={`${c.sidebar} / ${c[view]}`}>
                  {c.sidebar}
                  <span className="breadcrumb"> / </span>
                  {c[view]}
                </span>
                <div>
                  <Search size={17} aria-hidden="true" />
                  <Bell size={17} aria-hidden="true" />
                  <span className="avatar avatar-0">R</span>
                </div>
              </div>
              <div className="workspace-greeting">
                <div className="workspace-greeting-copy">
                  <div>
                    <h3>{view === "dashboard" ? c.greeting : c[view]}</h3>
                    <p>{descriptions[view]}</p>
                  </div>
                  {/* Reserve the tallest translated heading without fixed text heights. */}
                  {navigation.map((item) => (
                    <div
                      className="workspace-greeting-reserve"
                      key={item}
                      aria-hidden="true"
                    >
                      <h3>{item === "dashboard" ? c.greeting : c[item]}</h3>
                      <p>{descriptions[item]}</p>
                    </div>
                  ))}
                </div>
                <span className="workspace-date">
                  <CalendarDays size={13} aria-hidden="true" />
                  {c.week}
                </span>
              </div>
              <div
                className="workspace-content"
                ref={contentRef}
                role="region"
                aria-label={c[view]}
                tabIndex={0}
              >
                {/* Mount the active panel before its animation observers attach. */}
                <div className="workspace-panels" key={view}>
                  {navigation.map((item) => (
                    <Tabs.Content key={item} value={item}>
                      <WorkspaceDashboard
                        view={item}
                        copy={c}
                        locale={locale}
                        approved={approved}
                        onReview={openReview}
                      />
                    </Tabs.Content>
                  ))}
                </div>
              </div>
              <div className="workspace-disclaimer">
                <span className="connection-dot" aria-hidden="true" />
                {c.sample}
                <span className="sr-only" aria-live="polite" role="status">
                  {approved ? c.approvedNotice : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setApproved(false)}
                  disabled={!approved}
                >
                  {c.reset}
                </button>
              </div>
            </div>
          </Tabs.Root>
          <p className="workspace-bottom-note">{c.illustration}</p>
        </div>
      </div>
      <Dialog.Root open={dialog} onOpenChange={setDialog}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={`sample-dialog-overlay ${motionStyles.overlay}`}
          />
          <Dialog.Content
            className={`sample-dialog ${motionStyles.dialog}`}
            dir={ar ? "rtl" : "ltr"}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              const target = approved
                ? workspaceRef.current?.querySelector<HTMLElement>(".workspace-disclaimer button")
                : reviewTrigger.current;
              if (target?.isConnected) target.focus({ preventScroll: true });
              else contentRef.current?.focus({ preventScroll: true });
            }}
          >
            <span className="dialog-icon">
              <CalendarDays size={24} aria-hidden="true" />
            </span>
            <Dialog.Title>{c.leaveRequest}</Dialog.Title>
            <Dialog.Description>{c.dialogDescription}</Dialog.Description>
            <div className="request-detail">
              <span className="avatar avatar-0">R</span>
              <span>{c.requestDetail}</span>
            </div>
            <div className="dialog-actions">
              <button
                className="action action-primary"
                onClick={() => {
                  setApproved(true);
                  setDialog(false);
                }}
                disabled={approved}
              >
                {approved ? c.approved : c.approve}
                <Check size={16} aria-hidden="true" />
              </button>
              <Dialog.Close className="action action-secondary">
                {c.close}
              </Dialog.Close>
            </div>
            <Dialog.Close className="sample-dialog-close" aria-label={c.close}>
              <X size={20} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
