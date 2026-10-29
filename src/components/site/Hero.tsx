"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Phone, CalendarCheck, Star, ChevronDown, MapPin, Clock, Heart, Stethoscope, ShieldCheck } from "lucide-react";
import { hospital } from "@/lib/data";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yBgSpring = useSpring(yBg, { stiffness: 120, damping: 30, mass: 0.4 });
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.78, 0.95]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setScrolled(v > 0.05));
    return () => unsub();
  }, [scrollYProgress]);

  // EKG heartbeat line draw
  useEffect(() => {
    if (reduce) return;
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
  }, [reduce]);

  const floatingCards = [
    { icon: Heart, label: "Women's Healthcare", delay: 0.9 },
    { icon: Stethoscope, label: "Expert Consultations", delay: 1.05 },
    { icon: ShieldCheck, label: "Patient-Centred Care", delay: 1.2 },
  ];

  return (
    <section
      ref={root}
      className="relative min-h-[100svh] w-full overflow-hidden bg-[var(--brand-navy)] text-white"
    >
      {/* Background: video with image fallback */}
      <motion.div
        style={{ y: yBgSpring, scale: scaleBg }}
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        {videoOk && (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80"
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setVideoOk(false)}
          >
            <source
              src="https://cdn.pixabay.com/video/2022/12/25/142911-781565658_large.mp4"
              type="video/mp4"
            />
          </video>
        )}
        {/* Image fallback / poster always behind video */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
      </motion.div>

      {/* Gradient overlay for text readability */}
      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(18,48,74,0.95) 0%, rgba(18,48,74,0.82) 40%, rgba(13,148,136,0.55) 100%)",
          }}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 -z-10 bg-grain opacity-20" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-24 -z-10 h-72 w-72 rounded-full bg-[var(--brand-teal)]/30 blur-3xl animate-drift" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-1/3 -z-10 h-80 w-80 rounded-full bg-[var(--brand-cyan)]/20 blur-3xl animate-float-slow" aria-hidden />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-12"
      >
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[var(--brand-cyan)] ring-1 ring-white/15">
            <Star className="h-3.5 w-3.5 fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
            {hospital.rating} · {hospital.reviewCount} Google reviews
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/15">
            <MapPin className="h-3.5 w-3.5" />
            Sigra, Varanasi
          </span>
        </motion.div>

        {/* MAIN HEADING — plain HTML text, immediately visible, no masking */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 font-[var(--font-fraunces)] text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[8.5rem]"
        >
          <span className="block">CITY HOSPITAL</span>
          <span className="font-deva mt-2 block text-2xl font-medium text-[var(--brand-cyan)] sm:text-3xl lg:text-4xl">
            {hospital.nameHindi}
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 font-[var(--font-fraunces)] text-xl font-light text-[var(--brand-cyan)] sm:text-2xl lg:text-3xl"
        >
          Compassionate Care. Better Health. Brighter Futures.
        </motion.p>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg"
        >
          Comprehensive healthcare with compassionate specialists, modern medical
          facilities, and dedicated patient care in Sigra, Varanasi.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
        >
          <a
            href={`tel:${hospital.phoneTel}`}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-7 py-4 text-base font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-teal-deep)]"
            aria-label="Book an appointment, call City Hospital"
          >
            <CalendarCheck className="h-5 w-5" />
            Book an Appointment
          </a>
          <a
            href="tel:+919936000099"
            className="group inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-4 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            aria-label="Call City Hospital"
          >
            <Phone className="h-5 w-5" />
            Call Hospital
          </a>
        </motion.div>

        {/* Floating info cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.85 } } }}
          className="mt-10 flex flex-wrap gap-3"
        >
          {floatingCards.map((card) => (
            <motion.div
              key={card.label}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md ring-1 ring-white/15"
            >
              <card.icon className="h-4 w-4 text-[var(--brand-cyan)]" />
              <span className="text-sm font-medium text-white/90">{card.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stat counters */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 sm:grid-cols-4"
        >
          {[
            { v: "3.8★", l: "Google Rating" },
            { v: "169+", l: "Reviews" },
            { v: "24×7", l: "Always Open" },
            { v: "6+", l: "Specialties" },
          ].map((st) => (
            <div key={st.l} className="bg-[var(--brand-navy)]/60 px-4 py-4 text-center backdrop-blur-sm sm:px-6">
              <div className="font-[var(--font-fraunces)] text-2xl font-bold text-[var(--brand-cyan)] sm:text-3xl">{st.v}</div>
              <div className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/60 sm:text-xs">{st.l}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* EKG heartbeat line at bottom */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full opacity-60">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <path
              className="ekg-path"
              d="M0,50 H320 L360,50 L380,20 L410,80 L440,50 H600 L640,50 L660,12 L690,88 L720,50 H900 L940,50 L960,24 L990,76 L1020,50 H1440"
              fill="none"
              stroke="var(--brand-cyan)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60"
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
