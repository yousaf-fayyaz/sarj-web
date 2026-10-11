/** Recognize a new gesture on its first event; coalesce trackpad momentum only. */
export function createWheelGestureTracker() {
  let lastWheel = -Infinity;
  let lastDirection = 0;
  let lastMagnitude = 0;

  return (event: WheelEvent) => {
    const direction = Math.sign(event.deltaY);
    if (!direction) return false;
    // Use input time: a busy rendering frame can delay queued momentum events
    // without turning them into another physical gesture.
    const now = event.timeStamp;
    const elapsed = now - lastWheel;
    const magnitude = Math.abs(event.deltaY);
    const discrete =
      event.deltaMode !== 0 ||
      (magnitude >= 40 && magnitude === lastMagnitude && elapsed >= 40);
    const fresh = discrete || direction !== lastDirection || elapsed >= 100;
    lastWheel = now;
    lastDirection = direction;
    lastMagnitude = magnitude;
    return fresh;
  };
}
