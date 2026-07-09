"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";
import anime from "animejs";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  className?: string;
  size?: number;
  strokeWidth?: number;
};

/**
 * Renders a lucide icon and draws its strokes on enter using anime.js.
 */
export default function DrawIcon({
  icon: Icon,
  className = "",
  size = 28,
  strokeWidth = 1.8,
}: Props) {
  const wrap = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrap, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!inView || !wrap.current) return;
    const paths = wrap.current.querySelectorAll("path, line, circle, polyline, rect");
    if (!paths.length) return;
    const setDash = (el: SVGElement) => {
      const len = (el as SVGPathElement).getTotalLength
        ? (el as SVGPathElement).getTotalLength()
        : 200;
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
    };
    paths.forEach((p) => setDash(p as SVGElement));
    anime({
      targets: paths,
      strokeDashoffset: [anime.get(paths[0], "strokeDashoffset"), 0],
      duration: 1400,
      delay: anime.stagger(90),
      easing: "easeOutQuart",
    });
  }, [inView]);

  return (
    <span
      ref={wrap}
      className={`inline-flex ${className}`}
      style={{ lineHeight: 0 }}
    >
      <Icon
        width={size}
        height={size}
        strokeWidth={strokeWidth}
        className="[&_*]:stroke-dasharray-[1] [&_*]:stroke-dashoffset-[0]"
      />
    </span>
  );
}
