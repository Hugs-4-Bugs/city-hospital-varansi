"use client";

import { motion } from "framer-motion";
import { Star, Users, Clock, Siren } from "lucide-react";
import { hospital } from "@/lib/data";
import StatCounter from "./StatCounter";

const items = [
  {
    icon: Star,
    label: "Google Rating",
    valueRender: () => (
      <>
        <StatCounter value={hospital.rating} decimals={1} />
        <span className="text-[var(--brand-gold)]"> / 5</span>
      </>
    ),
    sub: "honest and verified",
    accent: "text-[var(--brand-gold)]",
  },
  {
    icon: Users,
    label: "Patient Reviews",
    valueRender: () => (
      <>
        <StatCounter value={hospital.reviewCount} suffix="+" />
      </>
    ),
    sub: "on Google",
    accent: "text-[var(--brand-teal)]",
  },
  {
    icon: Clock,
    label: "Open",
    valueRender: () => <>24 × 7</>,
    sub: "every day, all year",
    accent: "text-[var(--brand-teal)]",
  },
  {
    icon: Siren,
    label: "Emergency",
    valueRender: () => <>Available</>,
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
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.1,
            }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="group relative flex cursor-default items-center gap-3 px-4 py-5 transition-colors hover:bg-white/40 sm:px-7 sm:py-6"
            data-cursor="hover"
          >
            <motion.div
              whileHover={{ rotate: -12, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
            >
              <it.icon className={`h-6 w-6 shrink-0 ${it.accent}`} />
            </motion.div>
            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="font-[var(--font-fraunces)] text-xl font-semibold leading-none text-[var(--brand-teal-ink)] sm:text-2xl"
              >
                {it.valueRender()}
              </motion.div>
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
      <div className="hidden text-center text-[0.7rem] text-[var(--muted-foreground)]/60 sm:block">
        Real numbers from City Hospital's public Google listing
      </div>
    </section>
  );
}
