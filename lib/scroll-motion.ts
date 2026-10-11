/** A single animation clock keeps the scroll, artwork, and parallax in sync. */
export type ScrollFrame = {
  time: number;
  delta: number;
  scroll: number;
  progress: number;
  velocity: number;
  pointerX: number;
  pointerY: number;
  enabled: boolean;
  compact: boolean;
};

const subscribers = new Set<(frame: ScrollFrame) => void>();
let currentFrame: ScrollFrame = {
  time: 0,
  delta: 0,
  scroll: 0,
  progress: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  enabled: false,
  compact: false,
};

export function subscribeScrollFrame(callback: (frame: ScrollFrame) => void) {
  subscribers.add(callback);
  callback(currentFrame);
  return () => {
    subscribers.delete(callback);
  };
}

export function publishScrollFrame(frame: ScrollFrame) {
  currentFrame = frame;
  subscribers.forEach((callback) => callback(frame));
}

const preferenceKey = "sarj-motion-paused";
const preferenceEvent = "sarj-motion-preference";
let pausedInMemory = false;

export function getMotionPreference(): "enabled" | "paused" | "system" {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return "system";
  let paused = pausedInMemory;
  try {
    paused = localStorage.getItem(preferenceKey) === "true";
  } catch {
    // The motion control also works when storage is unavailable.
  }
  return paused ? "paused" : "enabled";
}

export function subscribeMotionPreference(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  window.addEventListener(preferenceEvent, callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener(preferenceEvent, callback);
  };
}

export function setMotionPaused(paused: boolean) {
  pausedInMemory = paused;
  try {
    localStorage.setItem(preferenceKey, String(paused));
  } catch {
    // Keep the preference for this page session.
  }
  window.dispatchEvent(new Event(preferenceEvent));
}

export const getServerMotionPreference = () => "enabled" as const;
