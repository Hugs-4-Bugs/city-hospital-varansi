"use client";

import { motion } from "framer-motion";
import { Star, Users, Clock, Siren } from "lucide-react";

const items = [
  {
    icon: Star,
    label: "Google Rating",
    value: "3.8 / 5",
    sub: "honest & verified",
    accent: "text-[var(--brand-gold)]",
  },
  {
    icon: Users,
    label: "Patient Reviews",
    value: "169+",
    sub: "on Google",
    accent: "text-[var(--brand-teal)]",
  },
  {
    icon: Clock,
    label: "Open",
    value: "24 × 7",
    sub: "every day",
    accent: "text-[var(--brand-teal)]",
  },
  {
    icon: Siren,
    label: "Emergency",
    value: "Available",
    sub: "doctors on site",
    accent: "text-rose-600",
  },
];

export default function TrustBar() {
  return (
    <section className="relative z-10 -mt-px border-y border-[var(--brand-teal)]/10 bg-[var(--brand-cream)]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[var(--brand-teal)]/10 sm:grid-cols-4">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.08,
            }}
            className="flex items-center gap-3 px-4 py-5 sm:px-7 sm:py-6"
          >
            <it.icon className={`h-6 w-6 shrink-0 ${it.accent}`} />
            <div className="min-w-0">
              <div className="font-[var(--font-fraunces)] text-xl font-semibold leading-none text-[var(--brand-teal-ink)] sm:text-2xl">
                {it.value}
              </div>
              <div className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                {it.label}
              </div>
              <div className="truncate text-[0.7rem] text-[var(--muted-foreground)]/70">
                {it.sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
