"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, ShieldCheck, Clock, HeartHandshake } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const pillars = [
  {
    icon: Clock,
    title: "Round-the-clock",
    stat: "24×7",
    desc: "Doctors on site every hour, every day of the year.",
  },
  {
    icon: HeartHandshake,
    title: "Patient-first",
    stat: "169+",
    desc: "Google reviews praising Dr. Anjali Yadav's compassionate care.",
  },
  {
    icon: Activity,
    title: "Multi-specialty",
    stat: "6+",
    desc: "Specialties under one roof: gynaecology, surgery, orthopedics, ICU.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible",
    stat: "Ayushman",
    desc: "Empanelled for free treatment of eligible families.",
  },
];

export default function CinematicPin() {
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const cards = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || !heading.current || !cards.current) return;
    const ctx = gsap.context(() => {
      // Heading chars scale + fade as you scroll through
      const chars = heading.current!.querySelectorAll(".pin-char");
      gsap.fromTo(
        chars,
        { opacity: 0.12, scale: 0.85, filter: "blur(6px)" },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          stagger: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 60%",
            end: "center 30%",
            scrub: 1,
          },
        }
      );

      // Cards rise in sequence, pinned
      const cardEls = cards.current!.querySelectorAll(".pin-card");
      cardEls.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0, rotateX: 12 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: `top+=${i * 12}% 60%`,
              end: `top+=${i * 12 + 18}% 40%`,
              scrub: 1,
            },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const headingWords = ["Built", "for", "the", "moments", "that", "matter"];

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-[var(--brand-teal-ink)] py-24 text-[var(--brand-cream)] sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[var(--brand-teal)]/20 blur-[120px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2
          ref={heading}
          className="perspective-1000 text-center font-[var(--font-fraunces)] text-4xl font-light leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          {headingWords.map((w, i) => (
            <span key={i} className="mr-3 inline-block overflow-hidden align-bottom">
              <span className="pin-char inline-block">
                {w}
              </span>
            </span>
          ))}
        </h2>

        <div
          ref={cards}
          className="perspective-1000 mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {pillars.map((p) => (
            <div
              key={p.title}
              className="pin-card preserve-3d relative overflow-hidden rounded-2xl bg-white/[0.05] p-6 ring-1 ring-white/10"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--brand-gold)]/15 blur-2xl" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold-soft)] ring-1 ring-[var(--brand-gold)]/25">
                  <p.icon className="h-6 w-6" />
                </div>
                <div className="mt-5 font-[var(--font-fraunces)] text-3xl font-medium text-[var(--brand-gold-soft)] sm:text-4xl">
                  {p.stat}
                </div>
                <div className="mt-1 text-sm font-semibold text-[var(--brand-cream)]">
                  {p.title}
                </div>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-[var(--brand-cream)]/65">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
