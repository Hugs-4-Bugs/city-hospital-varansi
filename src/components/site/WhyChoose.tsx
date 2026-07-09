"use client";

import { motion } from "framer-motion";
import { whyChoose } from "@/lib/data";

export default function WhyChoose() {
  return (
    <section
      id="why"
      className="relative overflow-hidden bg-[var(--brand-teal-ink)] py-20 text-[var(--brand-cream)] sm:py-28"
    >
      {/* background details */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-25" aria-hidden />
      <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-[var(--brand-teal)]/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[var(--brand-gold)]/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-12">
        {/* sticky heading */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold-soft)] ring-1 ring-white/15"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-gold)]" />
            Why patients choose us
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance font-[var(--font-fraunces)] text-3xl font-light leading-[1.08] sm:text-4xl lg:text-5xl"
          >
            The strengths patients{" "}
            <span className="gradient-text-gold">keep mentioning.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-md text-pretty text-base leading-relaxed text-[var(--brand-cream)]/70"
          >
            We lead with what the reviews genuinely support — attentive
            gynaecology care, true 24×7 availability and a spacious, modern
            facility — not sweeping claims we can't back up.
          </motion.p>
        </div>

        {/* cards */}
        <div className="space-y-4">
          {whyChoose.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.06,
              }}
              className="group relative flex gap-5 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/[0.07] sm:p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold-soft)] ring-1 ring-[var(--brand-gold)]/25">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-3">
                  <span className="font-[var(--font-fraunces)] text-sm font-medium text-[var(--brand-gold-soft)]/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-[var(--font-fraunces)] text-lg font-semibold text-[var(--brand-cream)] sm:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--brand-cream)]/70">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
