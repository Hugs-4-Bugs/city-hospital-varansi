"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Navigation, Accessibility } from "lucide-react";
import { hospital } from "@/lib/data";
import SectionHeading from "./SectionHeading";
import MagneticButton from "./MagneticButton";

export default function Location() {
  const mapsEmbed = `https://www.google.com/maps?q=${hospital.mapsEmbedQuery}&output=embed`;
  return (
    <section
      id="location"
      className="relative bg-[var(--brand-cream)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Find Us"
          title={
            <>
              In the heart of <span className="gradient-text-teal">Sigra, Varanasi.</span>
            </>
          }
          subtitle="Chandrika Nagar Colony, just off the main Sigra thoroughfare — easy to reach, day or night."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl shadow-lift ring-1 ring-[var(--brand-teal)]/10"
          >
            <iframe
              title="City Hospital location map"
              src={mapsEmbed}
              className="h-[320px] w-full sm:h-[440px] lg:h-full"
              style={{ border: 0, minHeight: 360 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--brand-teal-deep)] shadow-soft backdrop-blur">
              City Hospital, Sigra
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-[var(--brand-teal)]/8">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Address
                  </div>
                  <div className="mt-1 text-pretty text-sm leading-relaxed text-[var(--brand-teal-ink)]">
                    {hospital.address.line1}
                    <br />
                    {hospital.address.line2}
                    <br />
                    {hospital.address.line3}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-[var(--brand-teal)]/8">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Hours
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-[var(--font-fraunces)] text-lg font-semibold text-[var(--brand-teal-ink)]">
                      Open 24 Hours
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    Every day · including holidays
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-[var(--brand-teal)]/8">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-gold)]/15 text-[#8a6a23]">
                  <Accessibility className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Accessibility &amp; Payments
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {hospital.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-[var(--brand-teal)]/6 px-2.5 py-1 text-[0.7rem] font-medium text-[var(--brand-teal-deep)] ring-1 ring-[var(--brand-teal)]/10"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-1 flex flex-wrap gap-3">
              <MagneticButton
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  hospital.address.full
                )}`}
                variant="primary"
                newTab
                ariaLabel="Get directions to City Hospital"
              >
                <Navigation className="h-4 w-4" />
                Get Directions
              </MagneticButton>
              <MagneticButton href={`tel:${hospital.phoneTel}`} variant="ghost">
                <Phone className="h-4 w-4" />
                {hospital.phoneDisplay}
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
