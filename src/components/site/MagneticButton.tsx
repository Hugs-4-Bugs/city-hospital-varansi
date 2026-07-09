"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "gold" | "ghost" | "whatsapp" | "outline";
  className?: string;
  strength?: number;
  newTab?: boolean;
  ariaLabel?: string;
};

const variants: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-[var(--brand-teal)] text-[var(--brand-cream)] hover:bg-[var(--brand-teal-deep)] shadow-soft",
  gold: "bg-[var(--brand-gold)] text-[#1a1308] hover:brightness-105 shadow-glow-gold",
  ghost:
    "bg-white/70 text-[var(--brand-teal-deep)] ring-hairline hover:bg-white glass",
  outline:
    "bg-transparent text-[var(--brand-cream)] ring-1 ring-[var(--brand-cream)]/40 hover:bg-[var(--brand-cream)]/10",
  whatsapp: "bg-[#25D366] text-[#04210f] hover:brightness-105",
};

export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  strength = 0.35,
  newTab = false,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setPos({ x: x * strength, y: y * strength });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  const baseClass = `group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 will-change-transform ${variants[variant]} ${className}`;

  const motionProps = {
    animate: { x: pos.x, y: pos.y },
    transition: { type: "spring" as const, stiffness: 220, damping: 18, mass: 0.4 },
    onMouseMove: handleMove,
    onMouseLeave: reset,
    whileTap: { scale: 0.95 },
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        className={baseClass}
        {...motionProps}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      aria-label={ariaLabel}
      className={baseClass}
      {...motionProps}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
