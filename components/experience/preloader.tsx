"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Brand } from "@/components/brand";
import type { Locale } from "@/lib/content";
import styles from "./preloader.module.css";

const mediaAssets = ["fonts", "images"] as const;
const backgroundAssets = ["scene", "particles", "rays"] as const;
const criticalAssets = [...mediaAssets, ...backgroundAssets] as const;
const pageAssets = [...mediaAssets, "scene"] as const;
type Asset = (typeof criticalAssets)[number];
const LoadingContext = createContext<(asset: Asset, available?: boolean) => void>(() => {});
const PreloadingContext = createContext(false);
const BackgroundContext = createContext(true);

export function useAssetReady() {
  return useContext(LoadingContext);
}

export function useExperienceLoading() {
  return useContext(PreloadingContext);
}

export function useBackgroundEnabled() {
  return useContext(BackgroundContext);
}

function preloadImages(root: HTMLElement) {
  // Decorative media below the fold keeps its native lazy-loading behavior.
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])'));

  const sources = new Set<string>();
  root.querySelectorAll<SVGImageElement>(".opening svg image").forEach((image) => {
    if (image.href.baseVal) sources.add(image.href.baseVal);
  });
  const fallback = root.querySelector(".atmosphere-fallback");
  const mask = fallback && getComputedStyle(fallback)
    .getPropertyValue("--atmosphere-fallback-image")
    .match(/url\(["']?([^"')]+)["']?\)/)?.[1];
  if (mask) sources.add(mask);
  sources.forEach((source) => {
    const image = new Image();
    image.src = source;
    images.push(image);
  });

  // decode() waits for SVG/raster decoding, including the selected picture source.
  return Promise.allSettled(images.map((image) => image.decode()));
}

export function ExperiencePreloader({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<ReadonlySet<Asset>>(() => new Set());
  const [phase, setPhase] = useState<"loading" | "revealing" | "ready">("loading");
  const [enhancementsReady, setEnhancementsReady] = useState(false);
  const [backgroundFallback, setBackgroundFallback] = useState(false);
  const [openingVisible, setOpeningVisible] = useState(true);
  const completeAsset = useCallback((asset: Asset, available = true) => {
    // Initial scene failure switches to the decoded static background. A later
    // context loss keeps the existing renderer's restoration path available.
    if (asset === "scene" && !available && root.current?.dataset.loading === "true") {
      setBackgroundFallback(true);
      setLoaded((previous) => new Set([...previous, ...backgroundAssets]));
      return;
    }
    setLoaded((previous) =>
      previous.has(asset) ? previous : new Set([...previous, asset]),
    );
  }, []);
  const busy = phase !== "ready";
  // A deep link does not wait for offscreen hero effects to become visible.
  const requiredAssets = openingVisible ? criticalAssets : pageAssets;
  const criticalReady = requiredAssets.every((asset) => loaded.has(asset));
  const progress = Math.round(requiredAssets.filter((asset) => loaded.has(asset)).length / requiredAssets.length * 100);
  const label = locale === "ar" ? "جارٍ تحميل سرج" : "Loading SARJ";

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const opening = element.querySelector(".opening");
    // Native fragment navigation may scroll after hydration. Track the hero's
    // actual visibility while loading instead of sampling its initial position.
    const visibility = new IntersectionObserver(([entry]) => {
      if (element.dataset.loading === "true") setOpeningVisible(entry.isIntersecting);
      else visibility.disconnect();
    });
    if (opening) visibility.observe(opening);
    else setOpeningVisible(false);
    let cancelled = false;
    const settle = (asset: Asset) => {
      if (!cancelled) completeAsset(asset);
    };
    const font = getComputedStyle(element).fontFamily;
    document.fonts.load(`400 16px ${font}`, locale === "ar" ? "سرج" : "Sarj")
      .then(() => document.fonts.ready)
      .catch(() => {})
      .then(() => settle("fonts"));
    preloadImages(element).then(() => settle("images"));

    // Optional fonts and the mask may use their CSS fallbacks on a slow network;
    // this timer never completes the WebGL scene or its first-frame callbacks.
    const timeout = window.setTimeout(() => mediaAssets.forEach(settle), 4000);
    return () => {
      cancelled = true;
      visibility.disconnect();
      clearTimeout(timeout);
    };
  }, [completeAsset, locale]);

  useEffect(() => {
    if (!busy) return;
    const element = content.current;
    const body = document.body;
    const lockCount = parseInt(body.getAttribute("data-scroll-locked") || "0", 10) || 0;
    document.documentElement.dataset.preloading = "true";
    // Share Radix's numeric lock count so a locale change cannot release a
    // concurrently closing menu's lock, or leave the loader's lock behind.
    body.setAttribute("data-scroll-locked", String(lockCount + 1));
    if (element) {
      element.inert = true;
      element.setAttribute("aria-busy", "true");
    }
    return () => {
      delete document.documentElement.dataset.preloading;
      const remaining = (parseInt(body.getAttribute("data-scroll-locked") || "0", 10) || 0) - 1;
      if (remaining > 0) body.setAttribute("data-scroll-locked", String(remaining));
      else body.removeAttribute("data-scroll-locked");
      if (element) {
        element.inert = false;
        element.removeAttribute("aria-busy");
      }
    };
  }, [busy]);

  useEffect(() => {
    if (!criticalReady) return;
    let secondFrame = 0;
    let finish = 0;
    // Each visible background layer has drawn its first frame (or fallen back).
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setPhase("revealing");
        finish = window.setTimeout(() => setPhase("ready"), 450);
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      clearTimeout(finish);
    };
  }, [criticalReady]);

  useEffect(() => {
    // Asset initialization must run behind the loader. Animation stays paused
    // independently until the complete background is ready and content unlocks.
    const start = () => setEnhancementsReady(true);
    if ("requestIdleCallback" in window) {
      const idle = window.requestIdleCallback(start, { timeout: 500 });
      return () => window.cancelIdleCallback(idle);
    }
    const timer = setTimeout(start, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (criticalReady) return;
    // A genuinely stalled initialization chooses a static background and
    // unmounts pending GPU work before revealing; it cannot pop in afterward.
    const timeout = window.setTimeout(() => {
      setBackgroundFallback(true);
      setLoaded(new Set(criticalAssets));
    }, 30000);
    return () => clearTimeout(timeout);
  }, [criticalReady]);

  return (
    <BackgroundContext.Provider value={enhancementsReady && !backgroundFallback}>
      <PreloadingContext.Provider value={busy}>
        <LoadingContext.Provider value={completeAsset}>
          <div
            ref={root}
            className="site marketing-site"
            dir={locale === "ar" ? "rtl" : "ltr"}
            lang={locale}
            id="top"
            data-loading={phase === "loading"}
            data-background={backgroundFallback ? "fallback" : loaded.has("scene") ? "ready" : "loading"}
          >
            {busy && (
              <div className={styles.overlay} data-complete={phase === "revealing"}>
                <div className={styles.identity}>
                  <Brand />
                </div>
                <div className={styles.status} role="status" aria-live="polite">
                  <span>{label}</span>
                  <span className={styles.percent} aria-hidden="true">{progress}%</span>
                </div>
                <div
                  className={styles.track}
                  role="progressbar"
                  aria-label={label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <span style={{ transform: `scaleX(${progress / 100})` }} />
                </div>
              </div>
            )}
            <div ref={content} className="experience-content">
              {children}
            </div>
            <noscript>
              <style>{`.${styles.overlay} { display: none; }`}</style>
            </noscript>
          </div>
        </LoadingContext.Provider>
      </PreloadingContext.Provider>
    </BackgroundContext.Provider>
  );
}
