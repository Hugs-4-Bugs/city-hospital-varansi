"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import anime from "animejs";

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

export default function StatCounter({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  duration = 1800,
  className = "",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const obj = { v: 0 };
    const anim = anime({
      targets: obj,
      v: value,
      duration,
      easing: "easeOutExpo",
      round: decimals === 0 ? 1 : Math.pow(10, decimals),
      update: () => {
        setDisplay(obj.v);
      },
    });
    return () => {
      anim.pause();
    };
  }, [inView, value, decimals, duration]);

  const formatted =
    decimals === 0
      ? Math.round(display).toLocaleString("en-IN")
      : display.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
