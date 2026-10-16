/** Scales [w, h] down so the width is at most `maxW`, keeping the aspect ratio. */
export const fitWithin = (w: number, h: number, maxW: number): [number, number] =>
  w <= maxW ? [w, h] : [maxW, Math.round((h * maxW) / w)];
