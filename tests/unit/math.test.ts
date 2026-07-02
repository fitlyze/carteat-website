import { describe, expect, it } from 'vitest';

import { clamp, lerp, parallaxOffset, scrollProgress } from '@/lib/utils/math';

describe('lerp', () => {
  it('returns a at n=0 and b at n=1', () => {
    expect(lerp(2, 10, 0)).toBe(2);
    expect(lerp(2, 10, 1)).toBe(10);
  });

  it('interpolates midway', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe('clamp', () => {
  it('passes through in-range values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps below min and above max', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it('works with a negative range (track offsets)', () => {
    expect(clamp(-500, -300, 0)).toBe(-300);
    expect(clamp(50, -300, 0)).toBe(0);
  });
});

describe('scrollProgress', () => {
  it('is 0 at the start of the track', () => {
    expect(scrollProgress(0, 1000)).toBe(0);
  });

  it('is 1 at the end of the track', () => {
    expect(scrollProgress(-1000, 1000)).toBe(1);
  });

  it('is 0.5 halfway', () => {
    expect(scrollProgress(-500, 1000)).toBe(0.5);
  });

  it('is 0 when there is no overflow', () => {
    expect(scrollProgress(-50, 0)).toBe(0);
  });

  it('clamps overshoot into [0, 1]', () => {
    expect(scrollProgress(-1200, 1000)).toBe(1);
    expect(scrollProgress(200, 1000)).toBe(0);
  });
});

describe('parallaxOffset', () => {
  // viewport 1000px, card at left=1000 width=500, maxShift=125
  it('is -maxShift when the card is about to enter from the right', () => {
    expect(parallaxOffset(0, 1000, 500, 1000, 125)).toBe(-125);
  });

  it('is 0 once the card has fully left on the left', () => {
    expect(parallaxOffset(1500, 1000, 500, 1000, 125)).toBe(0);
  });

  it('is halfway through at the crossing midpoint', () => {
    expect(parallaxOffset(750, 1000, 500, 1000, 125)).toBe(-62.5);
  });

  it('clamps outside the crossing range', () => {
    expect(parallaxOffset(-500, 1000, 500, 1000, 125)).toBe(-125);
    expect(parallaxOffset(9999, 1000, 500, 1000, 125)).toBe(0);
  });
});
