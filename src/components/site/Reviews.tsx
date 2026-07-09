"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Star, Quote, ExternalLink, ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";
import { reviews, hospital } from "@/lib/data";
import StatCounter from "./StatCounter";

export default function Reviews() {
  const track = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const x = useMotionValue(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const calc = () => {
      if (!track.current || !container.current) return;
      const left = Math.min(
        0,
        container.current.offsetWidth - track.current.scrollWidth
      );
      setConstraints({ left, right: 0 });
    };
    calc();
    window.addEventListener("resize", calc);
    const t = setTimeout(calc, 400);
    return () => {
      window.removeEventListener("resize", calc);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const unsub = x.on("change", (latest) => {
      const left = constraints.left;
      setAtStart(latest >= -2);
      setAtEnd(latest <= left + 2);
    });
    return () => unsub();
  }, [x, constraints]);

  const nudge = (dir: 1 | -1) => {
    if (!container.current) return;
    const amount = Math.min(container.current.offsetWidth * 0.8, 640);
    const target = Math.max(
      constraints.left,
      Math.min(0, x.get() - dir * amount)
    );
    x.set(target, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
  };

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-mist)] to-[var(--brand-cream)] py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-[var(--brand-gold)]/10 blur-3xl" aria-hidden />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)]/8 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-teal)]/15">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-gold)]" />
              Patient Voices
            </div>
            <h2 className="text-balance font-[var(--font-fraunces)] text-3xl leading-[1.1] text-[var(--brand-teal-ink)] sm:text-4xl lg:text-5xl">
              Real words from{" "}
              <span className="gradient-text-teal">real patients.</span>
            </h2>
            <div className="mt-5 inline-flex items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-soft ring-1 ring-[var(--brand-teal)]/10">
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(hospital.rating)
                        ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]"
                        : "text-[var(--brand-gold)]/30"
                    }`}
                  />
                ))}
              </div>
              <div className="h-6 w-px bg-[var(--brand-teal)]/15" />
              <div className="text-sm">
                <span className="font-[var(--font-fraunces)] text-lg font-semibold text-[var(--brand-teal-ink)]">
                  <StatCounter value={hospital.rating} decimals={1} suffix="★" />
                </span>
                <span className="ml-2 text-[var(--muted-foreground)]">
                  across{" "}
                  <span className="font-semibold text-[var(--brand-teal)]">
                    <StatCounter value={hospital.reviewCount} /> real
                  </span>{" "}
                  Google reviews
                </span>
              </div>
            </div>
          </div>

          {/* Desktop arrows */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label="Previous reviews"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--brand-teal-deep)] shadow-soft ring-1 ring-[var(--brand-teal)]/10 transition-all hover:bg-[var(--brand-teal)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label="Next reviews"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--brand-teal-deep)] shadow-soft ring-1 ring-[var(--brand-teal)]/10 transition-all hover:bg-[var(--brand-teal)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel track */}
      <div
        ref={container}
        className="relative mt-10 w-full overflow-hidden px-5 sm:px-8 lg:px-12"
      >
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--brand-cream)] to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--brand-cream)] to-transparent sm:w-16" />

        <motion.div
          ref={track}
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.08}
          dragTransition={{ power: 0.25, timeConstant: 320, modifyTarget: (t) => Math.round(t) }}
          className="flex cursor-grab gap-4 active:cursor-grabbing sm:gap-5"
          style={{ x, touchAction: "pan-y" }}
        >
          {reviews.map((r, i) => (
            <motion.article
              key={r.name + i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: Math.min(i * 0.04, 0.4),
              }}
              className="group relative flex w-[78vw] max-w-sm shrink-0 flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-[var(--brand-teal)]/8 transition-shadow duration-300 hover:shadow-lift sm:w-[340px]"
            >
              <div className="flex items-center justify-between">
                <Quote className="h-7 w-7 text-[var(--brand-gold)]/40" />
                <span className="rounded-full bg-[var(--brand-teal)]/8 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--brand-teal-deep)]">
                  {r.tag}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star
                    key={s}
                    className="h-3.5 w-3.5 fill-[var(--brand-gold)] text-[var(--brand-gold)]"
                  />
                ))}
              </div>
              <p className="mt-3 flex-1 text-pretty text-[0.95rem] leading-relaxed text-[var(--foreground)]/85">
                “{r.text}”
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-[var(--brand-teal)]/8 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-teal-deep)] font-[var(--font-fraunces)] text-sm font-semibold text-white">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[var(--brand-teal-ink)]">
                    {r.name}
                  </div>
                  <div className="text-[0.7rem] text-[var(--muted-foreground)]">
                    Verified Google reviewer
                  </div>
                </div>
              </div>
            </motion.article>
          ))}

          {/* End card → Google */}
          <motion.a
            href={hospital.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative flex w-[78vw] max-w-sm shrink-0 flex-col items-start justify-center rounded-2xl bg-[var(--brand-teal-ink)] p-6 text-[var(--brand-cream)] ring-1 ring-white/10 sm:w-[340px]"
          >
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[var(--brand-gold)]/20 blur-3xl" />
            <div className="text-4xl font-[var(--font-fraunces)] font-light text-[var(--brand-gold-soft)]">
              {hospital.reviewCount}+
            </div>
            <div className="mt-2 text-sm text-[var(--brand-cream)]/75">
              more reviews live on Google. Read what the full community says —
              the good, the mixed, everything.
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-5 py-2.5 text-sm font-semibold text-[#1a1308] transition-transform group-hover:translate-x-1">
              See All {hospital.reviewCount} Reviews
              <ExternalLink className="h-4 w-4" />
            </div>
          </motion.a>
        </motion.div>

        {/* drag hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
          <GripHorizontal className="h-4 w-4" />
          Drag to explore · {reviews.length} curated stories
        </div>
      </div>

      {/* Mobile see-all button */}
      <div className="mx-auto mt-8 max-w-7xl px-5 text-center sm:hidden">
        <a
          href={hospital.googleReviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-6 py-3.5 text-sm font-semibold text-[var(--brand-cream)] shadow-soft"
        >
          See All {hospital.reviewCount} Reviews on Google
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
