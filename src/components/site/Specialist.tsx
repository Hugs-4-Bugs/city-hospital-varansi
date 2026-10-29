"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Quote, CheckCircle2, ArrowRight, Award, GraduationCap } from "lucide-react";
import { hospital } from "@/lib/data";
import MagneticButton from "./MagneticButton";

export default function Specialist() {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start end", "end start"],
  });
  const yPhoto = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const yBadge = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section
      ref={root}
      id="specialist"
      className="relative overflow-hidden bg-[var(--brand-cream)] py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full bg-[var(--brand-rose)]/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[var(--brand-teal)]/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12">
        {/* Image side with reveal + parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-2 lg:order-1"
        >
          <div className="relative mx-auto max-w-md lg:max-w-none">
            {/* gold frame */}
            <div className="absolute -right-4 -top-4 h-full w-full rounded-[1.75rem] border border-[var(--brand-gold)]/40" aria-hidden />
            <div className="absolute -bottom-4 -left-4 h-full w-full rounded-[1.75rem] bg-[var(--brand-teal)]/8" aria-hidden />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[var(--brand-teal-deep)] to-[var(--brand-teal-ink)] shadow-lift">
              {/* Reveal mask */}
              <motion.div
                initial={{ scaleY: 1 }}
                whileInView={{ scaleY: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }}
                style={{ originY: 0 }}
                className="absolute inset-0 z-20 bg-[var(--brand-teal-ink)]"
                aria-hidden
              />
              <motion.div
                style={{ y: yPhoto }}
                className="absolute inset-0 scale-110"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${hospital.specialist.image})` }}
                  role="img"
                  aria-label={`Portrait of ${hospital.specialist.name}, ${hospital.specialist.specialty}`}
                />
              </motion.div>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(6,35,31,0) 0%, rgba(6,35,31,0) 50%, rgba(6,35,31,0.85) 100%)",
                }}
                aria-hidden
              />

              {/* Floating credential badge */}
              <motion.div
                style={{ y: yBadge }}
                className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lift backdrop-blur sm:right-5 sm:top-5"
              >
                <GraduationCap className="h-4 w-4 text-[var(--brand-teal)]" />
                <span className="text-xs font-semibold text-[var(--brand-teal-ink)]">
                  IMS BHU
                </span>
              </motion.div>

              {/* Name plate */}
              <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl bg-[var(--brand-teal-ink)]/70 p-4 backdrop-blur-md ring-1 ring-white/10 sm:inset-x-5 sm:bottom-5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-gold-soft)]">
                  Featured Specialist
                </div>
                <div className="font-[var(--font-fraunces)] text-2xl font-medium text-white sm:text-3xl">
                  {hospital.specialist.name}
                </div>
                <div className="mt-0.5 text-sm text-[var(--brand-cream)]/75">
                  {hospital.specialist.specialty}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text side */}
        <div className="order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-rose)]/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-rose)]/30"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-rose)]" />
            Gynaecology &amp; Maternity
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-3xl leading-[1.1] text-[var(--brand-teal-ink)] sm:text-4xl lg:text-5xl"
          >
            Care that patients{" "}
            <span className="gradient-text-teal">remember by name.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 flex gap-3"
          >
            <Quote className="h-7 w-7 shrink-0 text-[var(--brand-gold)]" />
            <p className="text-pretty text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
              {hospital.specialist.blurb}
            </p>
          </motion.div>

          {/* Credential chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 flex flex-wrap gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-teal)]/8 px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-teal)]/12">
              <Award className="h-3.5 w-3.5" />
              {hospital.specialist.credential}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-gold)]/12 px-3 py-1.5 text-xs font-semibold text-[#8a6a23] ring-1 ring-[var(--brand-gold)]/20">
              <GraduationCap className="h-3.5 w-3.5" />
              Fellowship, Reproductive Medicine
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-rose)]/15 px-3 py-1.5 text-xs font-semibold text-[#9c4d47] ring-1 ring-[var(--brand-rose)]/25">
              {hospital.specialist.experience} experience
            </span>
          </motion.div>

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ staggerChildren: 0.08 }}
            className="mt-7 space-y-3.5"
          >
            {hospital.specialist.points.map((p) => (
              <motion.li
                key={p}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-teal)]" />
                <span className="text-pretty text-[0.97rem] leading-relaxed text-[var(--foreground)]/85">
                  {p}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-9"
          >
            <MagneticButton
              href={`tel:${hospital.phoneTel}`}
              variant="primary"
              className="px-6 py-3.5"
            >
              Book with Dr. Anjali
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
