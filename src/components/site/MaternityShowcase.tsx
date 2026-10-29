"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  Baby,
  Heart,
  Activity,
  Stethoscope,
  Flower2,
  ShieldCheck,
  Sparkles,
  Clock,
  Phone,
  CalendarCheck,
  ChevronDown,
  Play,
} from "lucide-react";
import { hospital } from "@/lib/data";
import { SplitText, Reveal } from "./Motion";

const services = [
  {
    icon: Baby,
    title: "Pregnancy & Antenatal Care",
    desc: "Regular pregnancy check-ups, maternal health monitoring, and personalised guidance throughout pregnancy.",
    img: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Heart,
    title: "Normal Delivery & Birth Support",
    desc: "Individualised delivery planning and supportive maternity care, based on the mother's clinical needs and medical assessment.",
    img: "https://images.unsplash.com/photo-1530978049014-c8b5f9c75735?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: ShieldCheck,
    title: "High-Risk Pregnancy Care",
    desc: "Care planning and monitoring for pregnancies that require additional medical attention.",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Stethoscope,
    title: "Gynaecological Consultations",
    desc: "Professional consultations for menstrual concerns, reproductive health, and common gynaecological conditions.",
    img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Flower2,
    title: "Fertility & Reproductive Health",
    desc: "Consultations and evaluation for fertility concerns and reproductive health.",
    img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80",
  },
  {
    icon: Activity,
    title: "Postnatal & New-Mother Care",
    desc: "Follow-up consultations, recovery guidance, and support for mothers after delivery.",
    img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
  },
];

const journey = [
  { step: 1, title: "Initial Consultation", desc: "First visit to confirm pregnancy and assess overall health." },
  { step: 2, title: "Pregnancy Monitoring", desc: "Regular scans, growth tracking and personalised care planning." },
  { step: 3, title: "Delivery Planning", desc: "Birth plan discussion with the clinical team as due date approaches." },
  { step: 4, title: "Postnatal Follow-up", desc: "Recovery support for mother and baby after delivery." },
];

const faqs = [
  {
    q: "When should I schedule my first pregnancy consultation?",
    a: "We recommend scheduling your first consultation as soon as you confirm your pregnancy, typically around 6 to 8 weeks. Early consultations allow our team to assess your health, start prenatal guidance, and plan your care journey.",
  },
  {
    q: "What should I bring to my appointment?",
    a: "Please bring any previous medical records, ultrasound reports, a list of current medications, and your Ayushman Bharat card if applicable. For gynaecology consultations, note down your symptoms and last menstrual period dates.",
  },
  {
    q: "How can I book a consultation?",
    a: "You can book by calling " + hospital.phoneDisplay + " or using the Call Hospital button on this page. Our front desk will help you schedule with the right specialist.",
  },
  {
    q: "How do I confirm doctor availability?",
    a: "Doctor schedules can vary by day. Please call ahead to confirm Dr. Anjali Yadav or the relevant specialist is available before visiting, especially for planned consultations.",
  },
  {
    q: "Which emergency number should I call?",
    a: "For emergencies, call " + hospital.phoneDisplay + ". City Hospital is open 24 hours with emergency and trauma care available round the clock.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--brand-teal)]/10"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
        aria-expanded={open}
      >
        <span className="font-[var(--font-fraunces)] text-base font-semibold text-[var(--brand-navy)] sm:text-lg">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-cyan)] text-[var(--brand-teal)]"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-5 pb-5 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)] sm:px-6 sm:pb-6">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MaternityShowcase() {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [videoOk, setVideoOk] = useState(true);

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start end", "end start"],
  });
  const yFeatured = useTransform(scrollYProgress, [0, 1], ["-5%", "8%"]);

  return (
    <section
      ref={root}
      id="maternity"
      className="relative overflow-hidden bg-[var(--brand-cream)] py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[var(--brand-cyan)]/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-[var(--brand-teal)]/12 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-teal)]/15"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Gynaecology · Obstetrics · Maternity
          </motion.div>

          <h2 className="text-balance font-[var(--font-fraunces)] text-3xl font-bold leading-[1.08] text-[var(--brand-navy)] sm:text-4xl lg:text-5xl">
            Gynaecologist, Obstetrician &amp;{" "}
            <span className="text-[var(--brand-teal)]">Maternity Care</span>
          </h2>

          <Reveal variant="slide" direction="up" delay={0.15}>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
              Personalised women's healthcare, compassionate pregnancy support,
              and dedicated maternity care for every stage of your journey.
            </p>
          </Reveal>
        </div>

        {/* Featured 16:9 visual with video loop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-12 overflow-hidden rounded-3xl shadow-lift ring-1 ring-[var(--brand-navy)]/10"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Video with poster + fallback */}
          {videoOk && !reduce && (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1600&q=80"
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setVideoOk(false)}
            >
              <source
                src="https://cdn.pixabay.com/video/2020/04/09/35881-410541414_large.mp4"
                type="video/mp4"
              />
            </video>
          )}
          {/* Image fallback always behind */}
          <motion.div style={{ y: yFeatured }} className="absolute inset-0 scale-105">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=1600&q=80')",
              }}
              role="img"
              aria-label="Doctor consulting with an expectant mother"
            />
          </motion.div>
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(18,48,74,0.5) 0%, rgba(18,48,74,0.1) 40%, rgba(13,148,136,0.4) 100%)",
            }}
          />
          {/* Floating Women's Healthcare card */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-4 top-4 flex items-center gap-2.5 rounded-2xl bg-white/90 px-4 py-3 shadow-lift backdrop-blur-md sm:left-6 sm:top-6"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-teal-deep)]">
                Women's Healthcare
              </div>
              <div className="text-[0.7rem] text-[var(--muted-foreground)]">
                Compassionate &amp; professional
              </div>
            </div>
          </motion.div>
          {/* Heartbeat waveform */}
          {!reduce && (
            <div className="absolute inset-x-0 bottom-0 h-16 opacity-60">
              <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
                <path
                  d="M0,40 H300 L330,40 L345,15 L365,65 L385,40 H580 L610,40 L625,8 L645,72 L665,40 H880 L910,40 L925,18 L945,62 L965,40 H1440"
                  fill="none"
                  stroke="var(--brand-cyan)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
            </div>
          )}
        </motion.div>

        {/* Service cards grid — 6 cards */}
        <div className="mt-16">
          <Reveal variant="slide" direction="up">
            <h3 className="mb-8 text-center font-[var(--font-fraunces)] text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">
              Our Maternity &amp; Women's Health Services
            </h3>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {services.map((s) => (
              <motion.article
                key={s.title}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-[var(--brand-teal)]/8 transition-shadow hover:shadow-lift"
                data-cursor="hover"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden sm:h-48">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${s.img}')` }}
                    role="img"
                    aria-label={s.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-navy)]/60 to-transparent" />
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 14 }}
                    className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-[var(--brand-teal)] shadow-soft backdrop-blur"
                  >
                    <s.icon className="h-5 w-5" />
                  </motion.div>
                </div>
                {/* Content */}
                <div className="p-5 sm:p-6">
                  <h4 className="font-[var(--font-fraunces)] text-lg font-semibold text-[var(--brand-navy)]">
                    {s.title}
                  </h4>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {s.desc}
                  </p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* Pregnancy Journey Timeline */}
        <div className="mt-20">
          <Reveal variant="slide" direction="up">
            <h3 className="mb-10 text-center font-[var(--font-fraunces)] text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">
              Your Maternity Care Journey
            </h3>
          </Reveal>
          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-[var(--brand-teal)]/30 to-transparent lg:block" />
            {journey.map((j, i) => (
              <motion.div
                key={j.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}
                  className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-teal)] font-[var(--font-fraunces)] text-lg font-bold text-white shadow-lift"
                >
                  {j.step}
                </motion.div>
                <h4 className="font-[var(--font-fraunces)] text-base font-semibold text-[var(--brand-navy)] sm:text-lg">
                  {j.title}
                </h4>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {j.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-20 max-w-3xl">
          <Reveal variant="slide" direction="up">
            <h3 className="mb-8 text-center font-[var(--font-fraunces)] text-2xl font-bold text-[var(--brand-navy)] sm:text-3xl">
              Frequently Asked Questions
            </h3>
          </Reveal>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </div>

        {/* Appointment CTA panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-20 overflow-hidden rounded-3xl bg-[var(--brand-navy)] p-8 text-center shadow-lift sm:p-12"
        >
          <div className="pointer-events-none absolute inset-0 bg-grain opacity-15" aria-hidden />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--brand-teal)]/30 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[var(--brand-cyan)]/20 blur-3xl" aria-hidden />
          <div className="relative">
            <h3 className="font-[var(--font-fraunces)] text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Looking for Women's Healthcare in Sigra, Varanasi?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
              Contact City Hospital to enquire about consultations, pregnancy
              care, and maternity services.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a
                href={`tel:${hospital.phoneTel}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-7 py-4 text-base font-semibold text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-teal-deep)]"
              >
                <CalendarCheck className="h-5 w-5" />
                Book an Appointment
              </a>
              <a
                href="tel:+919936000099"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-4 text-base font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <Phone className="h-5 w-5" />
                Call +91 99360 00099
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
