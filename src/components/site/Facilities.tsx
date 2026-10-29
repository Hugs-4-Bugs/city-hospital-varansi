"use client";

import { motion } from "framer-motion";
import { hospital } from "@/lib/data";

export default function Facilities() {
  return (
    <section className="relative bg-[var(--brand-cream)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex items-center gap-3"
        >
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-px flex-1 bg-[var(--brand-teal)]/15"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-teal-deep)]">
            Under one roof
          </span>
          <motion.span
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="h-px flex-1 bg-[var(--brand-teal)]/15"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
          }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
        >
          {hospital.facilities.map((f) => (
            <motion.div
              key={f.label}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.85, filter: "blur(8px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              whileHover={{ y: -6, scale: 1.05 }}
              className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center ring-1 ring-[var(--brand-teal)]/8 transition-shadow hover:shadow-soft"
              data-cursor="hover"
            >
              <motion.div
                whileHover={{ rotate: -8, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-teal)]/8 text-[var(--brand-teal)]"
              >
                <f.icon className="h-5 w-5" />
              </motion.div>
              <span className="text-pretty text-xs font-medium leading-snug text-[var(--brand-teal-ink)]">
                {f.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
