'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { formatIDR } from '@/domain/pricing';
import { dur } from '@/components/3d/motion';

/** Price that rolls to its new value so changes are noticeable. */
export const RollingNumber: React.FC<{ value: number }> = ({ value }) => {
  const [shown, setShown] = useState(value);
  const state = useRef({ v: value });
  useEffect(() => {
    const t = gsap.to(state.current, { v: value, duration: dur(0.6), ease: 'power3.out', onUpdate: () => setShown(Math.round(state.current.v)) });
    if (dur(1) === 0) setShown(value);
    return () => { t.kill(); };
  }, [value]);
  return (
    <>
      <span aria-hidden="true">{formatIDR(shown)}</span>
      <span className="sr-only" aria-live="polite">{formatIDR(value)}</span>
    </>
  );
};
