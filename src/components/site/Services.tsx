"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";
import { services, hospital, type Service } from "@/lib/data";
import DrawIcon from "./DrawIcon";
import SectionHeading from "./SectionHeading";

const accentMap: Record<
  Service["accent"],
  { ring: string; bg: string; text: string; glow: string; dot: string }
> = {
  teal: {
    ring: "group-hover:ring-[var(--brand-teal)]/30",
    bg: "bg-[var(--brand-teal)]/8 text-[var(--brand-teal)]",
    text: "text-[var(--brand-teal)]",
    glow: "group-hover:shadow-[0_24px_60px_-28px_rgba(14,107,102,0.55)]",
    dot: "bg-[var(--brand-teal)]",
  },
  gold: {
    ring: "group-hover:ring-[var(--brand-gold)]/40",
    bg: "bg-[var(--brand-gold)]/12 text-[#8a6a23]",
    text: "text-[#8a6a23]",
    glow: "group-hover:shadow-[0_24px_60px_-28px_rgba(201,162,75,0.6)]",
    dot: "bg-[var(--brand-gold)]",
  },
  rose: {
    ring: "group-hover:ring-[var(--brand-rose)]/40",
    bg: "bg-[var(--brand-rose)]/15 text-[#9c4d47]",
    text: "text-[#9c4d47]",
    glow: "group-hover:shadow-[0_24px_60px_-28px_rgba(201,138,134,0.6)]",
    dot: "bg-[var(--brand-rose)]",
  },
};

function TiltCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 18,
  });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const a = accentMap[service.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 60, rotateX: -15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.1,
      }}
      className="perspective-1000"
      data-cursor="hover"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY }}
        className={`group relative h-full overflow-hidden rounded-2xl bg-white p-6 ring-1 ring-[var(--brand-teal)]/8 transition-shadow duration-300 ${a.ring} ${a.glow} preserve-3d`}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--brand-gold)]/0 blur-2xl transition-all duration-500 group-hover:bg-[var(--brand-gold)]/15" />

        <div className="relative" style={{ transform: "translateZ(40px)" }}>
          <div className="flex items-start justify-between">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
              className={`flex h-14 w-14 items-center justify-center rounded-xl ${a.bg} ring-1 ring-current/10`}
            >
              <DrawIcon icon={service.icon} size={26} />
            </motion.div>
            <ArrowUpRight className="h-5 w-5 text-[var(--muted-foreground)] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </div>

          <h3 className="mt-5 font-[var(--font-fraunces)] text-xl font-semibold text-[var(--brand-teal-ink)] sm:text-2xl">
            {service.title}
          </h3>
          <p className="mt-2.5 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
            {service.desc}
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${a.text}`}
          >
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: "1.5rem" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className={`h-px ${a.dot} opacity-40`}
            />
            Available now
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="relative bg-gradient-to-b from-[var(--brand-cream)] to-[var(--brand-mist)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="What We Treat"
          title={
            <>
              Six specialties, <span className="gradient-text-teal">one roof.</span>
            </>
          }
          subtitle="From routine women's health to middle-of-the-night emergencies, City Hospital brings the most-needed specialties together under a single, modern facility in Sigra."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <TiltCard key={s.title} service={s} index={i} />
          ))}

          {/* CTA tile */}
          <motion.a
            href={`tel:${hospital.phoneTel}`}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.8, delay: services.length * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[var(--brand-teal-ink)] p-7 text-[var(--brand-cream)] ring-1 ring-white/10 transition-all duration-300"
            data-cursor="hover"
          >
            <div className="pointer-events-none absolute inset-0 bg-grain opacity-30" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[var(--brand-gold)]/20 blur-3xl" />
            <div className="relative">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold-soft)]">
                Not sure which specialty?
              </div>
              <h3 className="mt-3 font-[var(--font-fraunces)] text-2xl font-medium leading-tight">
                Call us, we'll guide you to the right care.
              </h3>
            </div>
            <div className="relative mt-8 inline-flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4" />
              {hospital.phoneDisplay}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
