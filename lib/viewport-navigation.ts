type ViewportNavigator = (top: number, immediate?: boolean) => void;

const navigators = new WeakMap<HTMLElement, ViewportNavigator>();

/** Move through the shared controller so an immediate stop cancels momentum. */
export function scrollViewportTo(element: HTMLElement, top: number, immediate = false) {
  const root = element.closest<HTMLElement>(".site");
  const navigate = root ? navigators.get(root) : undefined;
  if (navigate) navigate(top, immediate);
  else window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
}

/** Align the complete stage and cancel page momentum before its rail scrolls. */
export function alignViewportStage(stage: HTMLElement, immediate = true) {
  const bounds = stage.getBoundingClientRect();
  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const inset = Math.min(padding, Math.max(0, window.innerHeight - bounds.height));
  const top = Math.max(0, window.scrollY + bounds.top - inset);
  scrollViewportTo(stage, top, immediate);
}

/** Scroll explicit anchor navigation through the shared scroll controller. */
export function installViewportNavigation(
  root: HTMLElement,
  navigate: ViewportNavigator,
) {
  let frame = 0;
  let restoreTabIndex = () => {};
  navigators.set(root, navigate);

  const anchor = (event: MouseEvent) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;
    if (
      !link ||
      !link.hash ||
      (link.target && link.target !== "_self") ||
      link.hasAttribute("download") ||
      link.origin !== location.origin ||
      link.pathname !== location.pathname ||
      link.search !== location.search
    )
      return;
    let target: HTMLElement | null;
    try {
      target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    } catch {
      return;
    }
    if (!target || !root.contains(target)) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);

    // Let Radix close the menu and release its scroll lock before navigating.
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!target.isConnected) return;
      restoreTabIndex();
      if (target.getAttribute("aria-hidden") !== "true") {
        if (!target.hasAttribute("tabindex")) {
          const focusTarget = target;
          focusTarget.setAttribute("tabindex", "-1");
          const restore = () => {
            focusTarget.removeAttribute("tabindex");
            focusTarget.removeEventListener("blur", restore);
          };
          focusTarget.addEventListener("blur", restore);
          restoreTabIndex = restore;
        }
        target.focus({ preventScroll: true });
      }
      const padding =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) || 0;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      navigate(
        Math.max(
          0,
          window.scrollY + target.getBoundingClientRect().top - padding - margin,
        ),
      );
    });
  };

  document.addEventListener("click", anchor);
  return () => {
    cancelAnimationFrame(frame);
    restoreTabIndex();
    if (navigators.get(root) === navigate) navigators.delete(root);
    document.removeEventListener("click", anchor);
  };
}
