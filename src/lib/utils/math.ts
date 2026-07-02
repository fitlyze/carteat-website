/** Linear interpolation from `a` toward `b` by factor `n` in [0, 1]. */
export const lerp = (a: number, b: number, n: number): number => (1 - n) * a + n * b;

/** Clamps `value` into [min, max]. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Progress in [0, 1] of a horizontal track whose rendered offset is
 * `last` (≤ 0) against `maxScroll` (positive overflow width).
 */
export const scrollProgress = (last: number, maxScroll: number): number =>
  maxScroll <= 0 ? 0 : clamp(-last / maxScroll, 0, 1);

/**
 * Horizontal parallax offset for a card's image. Progress runs 0 → 1 while
 * the card crosses the viewport (entering right edge → leaving left edge);
 * the image translates from −maxShift to 0 over that crossing.
 * Assumes a real card and viewport (max > min); callers gate on in-view bounds, which excludes the degenerate zero-width case.
 */
export const parallaxOffset = (
  scrolled: number,
  cardLeft: number,
  cardWidth: number,
  viewportWidth: number,
  maxShift: number,
): number => {
  const min = cardLeft - viewportWidth;
  const max = cardLeft + cardWidth;
  const progress = clamp((scrolled - min) / (max - min), 0, 1);
  return (progress - 1) * maxShift;
};
