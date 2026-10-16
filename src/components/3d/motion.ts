export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Duration helper: 0 when the viewer prefers reduced motion. */
export const dur = (seconds: number) => (reducedMotion() ? 0 : seconds);
