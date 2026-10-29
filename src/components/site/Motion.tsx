"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type Variants,
} from "framer-motion";

/* ============================================================
 *  SplitText — splits a string into characters and staggers them
 *  with a mask reveal (translateY 110% → 0). Strong, dramatic.
 * ============================================================ */
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.035,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  const chars = text.split("");
  return (
    <span className={`inline-block overflow-hidden align-bottom ${className}`}>
      {chars.map((c, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden align-bottom"
          style={{ verticalAlign: "bottom" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once, margin: "-60px" }}
            transition={{
              duration: 0.7,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ============================================================
 *  Reveal — generic entrance with multiple variants.
 *  curtain: a mask wipes away to reveal content
 *  scale: scales up from 0.9 with blur
 *  slide: slides in from a direction
 * ============================================================ */
type RevealVariant = "curtain" | "scale" | "slide" | "blur";

export function Reveal({
  children,
  variant = "slide",
  delay = 0,
  direction = "up",
  once = true,
  className = "",
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
  className?: string;
}) {
  const offset =
    direction === "up"
      ? 40
      : direction === "down"
      ? -40
      : direction === "left"
      ? 40
      : -40;

  if (variant === "curtain") {
    return (
      <div className={`relative ${className}`}>
        <motion.div
          initial={{ y: "110%", opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once, margin: "-60px" }}
          transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
        <motion.div
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once, margin: "-60px" }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: [0.77, 0, 0.175, 1] }}
          style={{ originY: 0 }}
          className="pointer-events-none absolute inset-0 z-10 bg-current"
          aria-hidden
        />
      </div>
    );
  }

  if (variant === "scale") {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
        whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        viewport={{ once, margin: "-60px" }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  if (variant === "blur") {
    return (
      <motion.div
        initial={{ opacity: 0, filter: "blur(12px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once, margin: "-60px" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  // slide
  const x = direction === "left" || direction === "right" ? offset : 0;
  const y = direction === "up" || direction === "down" ? offset : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
 *  ParallaxLayer — moves at a different speed than scroll.
 *  speed < 1 moves slower (background feel), speed > 1 faster.
 * ============================================================ */
export function ParallaxLayer({
  children,
  speed = 0.5,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const ySpring = useSpring(y, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const scaledSpeed = useTransform(ySpring, (v) => v);
  const finalY = useTransform(scaledSpeed, (v) =>
    speed < 1 ? `calc(${v} * ${speed})` : v
  );
  return (
    <motion.div ref={ref} style={{ y: finalY }} className={className}>
      {children}
    </motion.div>
  );
}

/* ============================================================
 *  ScrollProgress — a top-of-page progress bar driven by scroll.
 * ============================================================ */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.3,
  });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-gold)] to-[var(--brand-rose)]"
      style={{ scaleX }}
      aria-hidden
    />
  );
}

/* ============================================================
 *  StaggerContainer + StaggerItem — parent/child staggered reveals.
 * ============================================================ */
export const StaggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const StaggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ============================================================
 *  MagneticElement — wraps any element with magnetic pull on hover.
 * ============================================================ */
export function MagneticElement({
  children,
  strength = 0.3,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`transition-transform duration-200 ease-out ${className}`}
      data-cursor="hover"
    >
      {children}
    </div>
  );
}
