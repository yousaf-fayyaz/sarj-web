import { subscribeScrollFrame, type ScrollFrame } from "./scroll-motion";
import type { CrystalizedBallLayout } from "@/components/CrystalizedBall";

type SarjBackgroundWindow = Window & {
  setSarjBackgroundFrame?: (frame: ScrollFrame) => void;
  disposeSarjBackgroundScene?: () => void;
};

/** Runs the background renderer in an isolated document. */
export function createAtmosphereScene(
  host: HTMLDivElement,
  onOpeningHost?: (element: HTMLElement, layout: CrystalizedBallLayout | null) => void,
  onStatus?: (available: boolean) => void,
) {
  const iframe = document.createElement("iframe");
  iframe.className = "atmosphere-canvas";
  iframe.title = "Decorative 3D background";
  iframe.tabIndex = -1;
  iframe.setAttribute("aria-hidden", "true");
  const theme = getComputedStyle(host);
  const colors = new URLSearchParams();
  for (const token of ["background", "foreground", "primary", "primary-hover"]) {
    colors.set(token, theme.getPropertyValue(`--${token}`).trim());
  }
  const site = host.closest<HTMLElement>(".site");
  const rtl = site?.dir === "rtl";
  // Mirror the complete Arabic viewport in CSS. Keeping the authored scene
  // coordinates also mirrors later formations and their particle handoffs.
  colors.set("direction", "ltr");
  iframe.src = `/backgrounds/sarj/index.html?${colors}`;
  const capabilities = site?.querySelector<HTMLElement>(".platform-overview");
  const main = site?.querySelector<HTMLElement>("#main-content");
  const sections = Array.from(main?.children ?? []).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );
  let canvasLimit = 1;
  let capabilitiesBounds: { top: number; bottom: number } | undefined;
  let stageBounds: { top: number; height: number; extra: number }[] = [];
  let viewportWidth = host.clientWidth;
  const measureCanvasPath = () => {
    viewportWidth = host.clientWidth;
    const spacing = main ? getComputedStyle(main) : undefined;
    const gap = parseFloat(spacing?.rowGap ?? "0") || 0;
    const endGap = parseFloat(spacing?.marginBottom ?? "0") || 0;
    stageBounds = sections.map((stage, index) => {
      const bounds = stage.getBoundingClientRect();
      const span = stage.dataset.canvasScrollSpan === "stage"
        ? parseFloat(getComputedStyle(stage).minHeight) || bounds.height
        : bounds.height;
      const height = bounds.height + (index < sections.length - 1 ? gap : endGap);
      return {
        top: bounds.top + window.scrollY,
        height,
        extra: Math.max(0, height - span),
      };
    });
    canvasLimit = Math.max(1, document.documentElement.scrollHeight - innerHeight
      - stageBounds.reduce((sum, stage) => sum + stage.extra, 0));
    if (capabilities) {
      const bounds = capabilities.getBoundingClientRect();
      capabilitiesBounds = { top: bounds.top + scrollY, bottom: bounds.bottom + scrollY };
    }
  };
  const canvasProgress = (scroll: number) => {
    // Stretch each scene span across its section and the shared space after it.
    // Taller team rows keep their full span; the reading bar stays literal.
    const extra = stageBounds.reduce((sum, stage) => {
      const progress = Math.max(0, Math.min(1, (scroll - stage.top) / Math.max(1, stage.height)));
      return sum + progress * stage.extra;
    }, 0);
    return Math.max(0, Math.min(1, (scroll - extra) / canvasLimit));
  };
  const sizeObserver = new ResizeObserver(measureCanvasPath);
  if (site) sizeObserver.observe(site);
  sections.forEach((stage) => sizeObserver.observe(stage));
  window.addEventListener("resize", measureCanvasPath, { passive: true });
  measureCanvasPath();
  const smooth = (value: number) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  let latest: ScrollFrame | undefined;
  let ready = false;
  const styles = new Map<string, string>();
  const setStyle = (property: string, value: string) => {
    if (styles.get(property) === value) return;
    styles.set(property, value);
    host.style.setProperty(property, value);
  };

  const onMessage = (event: MessageEvent) => {
    if (
      event.source !== iframe.contentWindow ||
      event.origin !== window.location.origin
    )
      return;
    if (event.data?.type === "sarj-background-opening") {
      const opening = iframe.contentDocument?.querySelector<HTMLElement & {
        openingLayout?: CrystalizedBallLayout;
      }>(".opening-crystalized-ball");
      if (opening) onOpeningHost?.(opening, opening.openingLayout ?? null);
    } else if (event.data?.type === "sarj-background-ready") {
      ready = true;
      host.dataset.ready = "true";
      host.dataset.renderer = "webgl";
      if (latest) (iframe.contentWindow as SarjBackgroundWindow)?.setSarjBackgroundFrame?.(latest);
      onStatus?.(true);
    } else if (event.data?.type === "sarj-background-unavailable") {
      ready = false;
      delete host.dataset.ready;
      host.dataset.renderer = "static";
      onStatus?.(false);
    }
  };
  window.addEventListener("message", onMessage);
  const unsubscribe = subscribeScrollFrame((frame) => {
    let canvasFrame = sections.length
      ? { ...frame, progress: canvasProgress(frame.scroll) }
      : frame;
    if (rtl) canvasFrame = { ...canvasFrame, pointerX: -frame.pointerX };
    latest = canvasFrame;
    if (capabilitiesBounds) {
      const enter = smooth((innerHeight - capabilitiesBounds.top + frame.scroll) / (innerHeight * 0.35));
      // Keep the canvas dark through every card; fade only after the section has passed.
      const leave = 1 - smooth((frame.scroll - capabilitiesBounds.bottom) / (innerHeight * 0.5));
      setStyle("--capabilities-canvas-shade", (enter * leave * 0.72).toFixed(3));
    }
    const travel = Math.max(0, Math.min(1, frame.scroll / (innerHeight * 1.6)));
    const fade = 1 - travel * travel * (3 - 2 * travel);
    const heroMotion = String(frame.enabled && fade > 0);
    if (host.dataset.heroMotion !== heroMotion) host.dataset.heroMotion = heroMotion;
    // Stars belong to the hero even when their animation has been paused.
    setStyle("--atmosphere-particles-presence", fade.toFixed(3));
    if (frame.enabled || !host.style.getPropertyValue("--atmosphere-presence")) {
      const ratio = Math.max(0, Math.min(1, frame.scroll / innerHeight));
      const path = ratio * ratio * (3 - 2 * ratio);
      const formationEnd = Math.min(400, innerHeight * 0.55);
      const ease = (value: number) => {
        const t = Math.max(0, Math.min(1, value));
        return t * t * t * (t * (t * 6 - 15) + 10);
      };
      const surface = ease((frame.scroll - formationEnd * 0.35) / (formationEnd * 0.65));
      const settled = ease((frame.scroll - formationEnd) / (innerHeight - formationEnd));
      const solidity = 0.95 * surface + 0.05 * settled;
      const sideways = frame.compact ? 0.24 : 0.4;
      const direction = rtl ? -1 : 1;
      setStyle("--atmosphere-presence", fade.toFixed(3));
      setStyle("--atmosphere-solidity", solidity.toFixed(3));
      setStyle("--atmosphere-roll", `${(-path * 126 * direction).toFixed(2)}deg`);
      setStyle("--atmosphere-travel-x", `${(-path * innerWidth * sideways * direction).toFixed(2)}px`);
      setStyle("--atmosphere-travel", `${(path * innerHeight * (frame.compact ? 0.06 : 0.2)).toFixed(2)}px`);
    }
    if (ready) (iframe.contentWindow as SarjBackgroundWindow)?.setSarjBackgroundFrame?.(canvasFrame);
  });
  const pointer = (event: PointerEvent) => {
    if (!ready || !latest?.enabled || event.pointerType === "touch") return;
    const child = iframe.contentWindow;
    if (!child) return;
    // Let the renderer apply its 0.6s tilt easing.
    child.dispatchEvent(new MouseEvent("mousemove", {
      clientX: rtl ? viewportWidth - event.clientX : event.clientX,
      clientY: event.clientY,
    }));
  };
  window.addEventListener("pointermove", pointer, { passive: true });
  host.appendChild(iframe);

  return () => {
    unsubscribe();
    sizeObserver.disconnect();
    window.removeEventListener("resize", measureCanvasPath);
    window.removeEventListener("message", onMessage);
    window.removeEventListener("pointermove", pointer);
    (iframe.contentWindow as SarjBackgroundWindow)?.disposeSarjBackgroundScene?.();
    iframe.remove();
    delete host.dataset.ready;
    delete host.dataset.renderer;
    delete host.dataset.heroMotion;
    ["--atmosphere-presence", "--atmosphere-solidity", "--atmosphere-particles-presence", "--atmosphere-roll", "--atmosphere-travel", "--atmosphere-travel-x", "--capabilities-canvas-shade"].forEach(
      (property) => host.style.removeProperty(property),
    );
  };
}
