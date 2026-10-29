"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Baby,
  Heart,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Activity,
  Clock,
  Syringe,
} from "lucide-react";
import { hospital } from "@/lib/data";
import { SplitText, Reveal } from "./Motion";

const features = [
  {
    icon: Baby,
    title: "Antenatal Care",
    desc: "Regular check-ups, ultrasound monitoring and nutritional guidance through every trimester of pregnancy.",
  },
  {
    icon: Heart,
    title: "Normal & Assisted Delivery",
    desc: "Dr. Anjali Yadav and her team support both natural and assisted deliveries in a calm, well-equipped labour ward.",
  },
  {
    icon: ShieldCheck,
    title: "High-Risk Pregnancy",
    desc: "Advanced Fellowship in Reproductive Medicine equips the team to manage high-risk pregnancies with confidence.",
  },
  {
    icon: Activity,
    title: "Newborn Care",
    desc: "Immediate postnatal monitoring for mother and baby, with neonatal support standing by around the clock.",
  },
];

const journey = [
  { week: "Trimester 1", label: "Confirmation & early scans" },
  { week: "Trimester 2", label: "Growth monitoring & anomaly scan" },
  { week: "Trimester 3", label: "Birth plan & delivery readiness" },
  { week: "Postnatal", label: "Mother & baby recovery support" },
];

export default function MaternityShowcase() {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start end", "end start"],
  });
  const yImg1 = useTransform(scrollYProgress, [0, 1], ["-8%", "12%"]);
  const yImg2 = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const yImg3 = useTransform(scrollYProgress, [0, 1], ["-5%", "8%"]);

  return (
    <section
      ref={root}
      id="maternity"
      className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-cream)] via-[var(--brand-mist)] to-[var(--brand-cream)] py-20 sm:py-28"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[var(--brand-rose)]/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-[var(--brand-teal)]/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-rose)]/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-rose)]/30"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            Gynaecology · Obstetrics · Maternity
          </motion.div>

          <h2 className="text-balance font-[var(--font-fraunces)] text-3xl font-light leading-[1.08] text-[var(--brand-teal-ink)] sm:text-4xl lg:text-6xl">
            <SplitText text="Where new" delay={0.05} stagger={0.03} />
            <br />
            <SplitText text="life begins," delay={0.3} stagger={0.03} className="gradient-text-teal" />
            <br />
            <SplitText text="gently." delay={0.6} stagger={0.04} />
          </h2>

          <Reveal variant="slide" direction="up" delay={0.7}>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
              Led by{" "}
              <span className="font-semibold text-[var(--brand-teal)]">
                Dr. Anjali Yadav
              </span>{" "}
              (MD Gynecology, IMS BHU · Fellowship in Reproductive Medicine),
              our maternity practice supports mothers from the first
              ultrasound through delivery and beyond, with round-the-clock
              obstetric coverage.
            </p>
          </Reveal>
        </div>

        {/* Image collage with parallax */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl shadow-lift lg:col-span-2"
            style={{ aspectRatio: "4/5" }}
          >
            <motion.div style={{ y: yImg1 }} className="absolute inset-0 scale-110">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1200&q=80')",
                }}
                role="img"
                aria-label="Doctor consulting a pregnant patient"
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(6,35,31,0) 0%, rgba(6,35,31,0.1) 50%, rgba(6,35,31,0.85) 100%)",
              }}
            />
            <div className="absolute inset-x-5 bottom-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-gold-soft)]">
                Consultation
              </div>
              <div className="font-[var(--font-fraunces)] text-xl font-medium sm:text-2xl">
                Patient, unhurried care
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl shadow-soft"
            style={{ aspectRatio: "1/1" }}
          >
            <motion.div style={{ y: yImg2 }} className="absolute inset-0 scale-110">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80')",
                }}
                role="img"
                aria-label="Newborn baby being held"
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(6,35,31,0) 50%, rgba(6,35,31,0.85) 100%)",
              }}
            />
            <div className="absolute inset-x-4 bottom-4 text-white">
              <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--brand-gold-soft)]">
                Newborn
              </div>
              <div className="font-[var(--font-fraunces)] text-sm font-medium">
                Safe arrival
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-3xl shadow-soft"
            style={{ aspectRatio: "1/1" }}
          >
            <motion.div style={{ y: yImg3 }} className="absolute inset-0 scale-110">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80')",
                }}
                role="img"
                aria-label="Ultrasound examination during pregnancy"
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(6,35,31,0) 50%, rgba(6,35,31,0.85) 100%)",
              }}
            />
            <div className="absolute inset-x-4 bottom-4 text-white">
              <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--brand-gold-soft)]">
                Diagnostics
              </div>
              <div className="font-[var(--font-fraunces)] text-sm font-medium">
                Ultrasound & scans
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.1,
              }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-soft ring-1 ring-[var(--brand-teal)]/8 transition-shadow hover:shadow-lift"
              data-cursor="hover"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--brand-rose)]/15 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <motion.div
                whileHover={{ rotate: -8, scale: 1.15 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-rose)]/15 text-[var(--brand-rose)] ring-1 ring-[var(--brand-rose)]/25"
              >
                <f.icon className="h-6 w-6" />
              </motion.div>
              <h3 className="mt-4 font-[var(--font-fraunces)] text-lg font-semibold text-[var(--brand-teal-ink)]">
                {f.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Pregnancy journey timeline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 rounded-3xl bg-[var(--brand-teal-ink)] p-6 text-[var(--brand-cream)] shadow-lift sm:p-10"
        >
          <div className="mb-8 flex items-center gap-3">
            <Clock className="h-5 w-5 text-[var(--brand-gold-soft)]" />
            <h3 className="font-[var(--font-fraunces)] text-xl font-medium sm:text-2xl">
              The pregnancy journey at City Hospital
            </h3>
          </div>
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-4">
            {/* connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-[var(--brand-gold)]/40 to-transparent sm:block" />
            {journey.map((step, i) => (
              <motion.div
                key={step.week}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-gold)] font-[var(--font-fraunces)] text-sm font-semibold text-[#1a1308]"
                >
                  {i + 1}
                </motion.div>
                <div className="text-sm font-semibold text-[var(--brand-gold-soft)]">
                  {step.week}
                </div>
                <div className="mt-1 text-sm text-[var(--brand-cream)]/75">
                  {step.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Stethoscope, label: "MD Gynecology, IMS BHU" },
            { icon: ShieldCheck, label: "Fellowship, Reproductive Medicine" },
            { icon: Clock, label: "24×7 obstetric coverage" },
            { icon: Syringe, label: "Ayushman Bharat empanelled" },
          ].map((b) => (
            <motion.div
              key={b.label}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--brand-teal-deep)] shadow-soft ring-1 ring-[var(--brand-teal)]/10"
            >
              <b.icon className="h-3.5 w-3.5 text-[var(--brand-teal)]" />
              {b.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
