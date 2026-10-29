"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone, CalendarCheck, Star, ChevronDown, MapPin } from "lucide-react";
import MagneticButton from "./MagneticButton";
import StatCounter from "./StatCounter";
import { hospital } from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const headline = ["City", "Hospital"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const bgImg = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });

  // Parallax via useTransform + spring
  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yImgSpring = useSpring(yImg, { stiffness: 120, damping: 30, mass: 0.4 });
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.92]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setScrolled(v > 0.05);
  });

  // anime.js EKG line draw on mount
  useEffect(() => {
    const path = root.current?.querySelector(".ekg-path") as SVGPathElement | null;
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    let raf = 0;
    const start = performance.now();
    const dur = 2600;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      if (path) path.style.strokeDashoffset = `${len * (1 - eased)}`;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={root}
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--brand-teal-ink)] text-[var(--brand-cream)]"
    >
      {/* Parallax image layer */}
      <motion.div
        ref={bgImg}
        style={{ y: yImgSpring, scale: scaleImg }}
        className="absolute inset-0 -z-10 bg-cover bg-center"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
      </motion.div>

      {/* Gradient overlay (scroll-fades) */}
      <motion.div
        ref={overlay}
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 70% 10%, rgba(14,107,102,0.55) 0%, rgba(6,35,31,0.92) 55%, rgba(6,35,31,0.98) 100%)",
          }}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-40" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-72 w-72 rounded-full bg-[var(--brand-gold)]/20 blur-3xl animate-drift" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-80 w-80 rounded-full bg-[var(--brand-teal)]/30 blur-3xl animate-float-slow" aria-hidden />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        {/* Badge row */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="relative inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200 ring-1 ring-emerald-300/30">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            Open 24 Hours
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[var(--brand-gold-soft)] ring-1 ring-white/15">
            <Star className="h-3.5 w-3.5 fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
            {hospital.rating} · {hospital.reviewCount} Google reviews
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-[var(--brand-cream)]/80 ring-1 ring-white/15">
            <MapPin className="h-3.5 w-3.5" />
            Sigra, Varanasi
          </span>
        </motion.div>

        {/* Headline with parallax on scroll */}
        <motion.h1
          ref={titleRef}
          style={{ y: titleY, opacity: titleOpacity }}
          className="mt-6 font-[var(--font-fraunces)] text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl lg:text-[8rem]"
        >
          <span className="block overflow-hidden">
            {headline.map((w, i) => (
              <motion.span
                key={w}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mr-4 inline-block gradient-text-cream [perspective:600px]"
              >
                {w}
              </motion.span>
            ))}
          </span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-deva mt-2 block text-3xl font-medium text-[var(--brand-gold-soft)] sm:text-4xl lg:text-5xl"
          >
            {hospital.nameHindi}
          </motion.span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--brand-cream)]/80 sm:text-lg"
        >
          Multi-specialty care in the heart of Sigra, led by{" "}
          <span className="font-semibold text-[var(--brand-gold-soft)]">
            Dr. Anjali Yadav
          </span>
          's gynaecology & maternity practice, with round-the-clock emergency,
          surgery, orthopedics and ICU support.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <MagneticButton
            href={`tel:${hospital.phoneTel}`}
            variant="gold"
            className="px-7 py-4 text-base"
            ariaLabel="Book an appointment, call City Hospital"
          >
            <CalendarCheck className="h-5 w-5" />
            Book an Appointment
          </MagneticButton>
          <MagneticButton
            href={`tel:${hospital.phoneTel}`}
            variant="outline"
            className="px-7 py-4 text-base"
            ariaLabel="Call City Hospital now"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </MagneticButton>
        </motion.div>

        {/* Stat counters */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 sm:grid-cols-4"
        >
          {[
            { v: 3.8, d: 1, s: "★", l: "Google Rating" },
            { v: 169, d: 0, s: "+", l: "Reviews" },
            { v: 24, d: 0, s: "×7", l: "Always Open" },
            { v: 6, d: 0, s: "+", l: "Specialties" },
          ].map((st) => (
            <div
              key={st.l}
              className="bg-[var(--brand-teal-ink)]/60 px-4 py-5 text-center backdrop-blur-sm sm:px-6"
            >
              <div className="font-[var(--font-fraunces)] text-3xl font-medium text-[var(--brand-gold-soft)] sm:text-4xl">
                <StatCounter value={st.v} decimals={st.d} suffix={st.s} />
              </div>
              <div className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--brand-cream)]/60 sm:text-xs">
                {st.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* EKG line at bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-50">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden
        >
          <path
            className="ekg-path"
            d="M0,50 H320 L360,50 L380,20 L410,80 L440,50 H600 L640,50 L660,12 L690,88 L720,50 H900 L940,50 L960,24 L990,76 L1020,50 H1440"
            fill="none"
            stroke="var(--brand-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[var(--brand-cream)]/60"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
