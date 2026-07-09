"use client";

import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";
import { hospital } from "@/lib/data";
import MagneticButton from "./MagneticButton";

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-teal-ink)] py-16 text-[var(--brand-cream)] sm:py-20">
      {/* bg details */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-25" aria-hidden />
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--brand-teal)]/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-[var(--brand-gold)]/15 blur-3xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl px-5 text-center sm:px-8"
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold-soft)] ring-1 ring-white/15">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>
          Doctors on site, right now
        </div>
        <h2 className="text-balance font-[var(--font-fraunces)] text-3xl font-light leading-[1.1] sm:text-4xl lg:text-5xl">
          Need care now?{" "}
          <span className="gradient-text-gold">We're a tap away.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-[var(--brand-cream)]/75 sm:text-lg">
          Call to book an appointment, or chat with us on WhatsApp for quick
          questions about gynaecology, maternity or emergency visits. Open 24
          hours, every day.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <MagneticButton
            href={`tel:${hospital.phoneTel}`}
            variant="gold"
            className="px-7 py-4 text-base"
            ariaLabel="Call City Hospital"
          >
            <Phone className="h-5 w-5" />
            Call {hospital.phoneDisplay}
          </MagneticButton>
          <MagneticButton
            href={`https://wa.me/${hospital.whatsapp}?text=${encodeURIComponent(
              "Hello City Hospital, I'd like to know more about your services."
            )}`}
            variant="whatsapp"
            newTab
            className="px-7 py-4 text-base"
            ariaLabel="Chat with City Hospital on WhatsApp"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Chat on WhatsApp
          </MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}
