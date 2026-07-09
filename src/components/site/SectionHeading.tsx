"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className = "",
}: Props) {
  const alignClass = align === "center" ? "mx-auto text-center" : "text-left";
  return (
    <div className={`${alignClass} max-w-3xl ${className}`}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${
            dark
              ? "bg-white/10 text-[var(--brand-gold-soft)] ring-1 ring-white/15"
              : "bg-[var(--brand-teal)]/8 text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-teal)]/12"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-gold)]" />
          {eyebrow}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className={`text-balance text-3xl leading-[1.08] sm:text-4xl md:text-5xl ${
          dark ? "text-[var(--brand-cream)]" : "text-[var(--brand-teal-ink)]"
        }`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className={`mt-5 text-pretty text-base leading-relaxed sm:text-lg ${
            dark ? "text-[var(--brand-cream)]/75" : "text-[var(--muted-foreground)]"
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
