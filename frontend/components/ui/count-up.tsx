'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function CountUp({
  end,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 2,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState('0');
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const prevEnd = useRef<number>(0);

  useEffect(() => {
    const startVal = prevEnd.current;
    prevEnd.current = end;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (end - startVal) * eased;
      setDisplay(Math.abs(current).toFixed(decimals));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, decimals]);

  return (
    <span className={className}>
      {end < 0 ? '-' : ''}
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
