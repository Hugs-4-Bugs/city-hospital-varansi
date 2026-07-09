"use client";

import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Star, ExternalLink, ArrowUp } from "lucide-react";
import { hospital } from "@/lib/data";
import { WhatsAppIcon } from "./CTABanner";

export default function Footer() {
  const scrollTop = () => {
    if (typeof window !== "undefined") {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis;
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-[var(--brand-teal-ink)] pt-16 text-[var(--brand-cream)]">
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="font-[var(--font-fraunces)] text-2xl font-light leading-none text-white">
              City Hospital
            </div>
            <div className="font-deva mt-1 text-lg text-[var(--brand-gold-soft)]">
              {hospital.nameHindi}
            </div>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-[var(--brand-cream)]/65">
              {hospital.category} in Sigra, Varanasi — led by Dr. Anjali Yadav's
              gynaecology &amp; maternity practice, open 24 hours.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs ring-1 ring-white/10">
              <Star className="h-3.5 w-3.5 fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
              <span className="font-semibold text-white">{hospital.rating}</span>
              <span className="text-[var(--brand-cream)]/60">
                · {hospital.reviewCount} reviews
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-gold-soft)]">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${hospital.phoneTel}`}
                  className="group flex items-center gap-2.5 text-[var(--brand-cream)]/80 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-[var(--brand-gold-soft)]" />
                  {hospital.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${hospital.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-[var(--brand-cream)]/80 transition-colors hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  WhatsApp us
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-[var(--brand-cream)]/80">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold-soft)]" />
                Open 24 Hours, every day
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-gold-soft)]">
              Address
            </h3>
            <a
              href={hospital.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-4 flex items-start gap-2.5 text-sm text-[var(--brand-cream)]/80 transition-colors hover:text-white"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold-soft)]" />
              <span>
                {hospital.address.line1}
                <br />
                {hospital.address.line2}
                <br />
                {hospital.address.line3}
              </span>
            </a>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-gold-soft)]">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { label: "Dr. Anjali Yadav", href: "#specialist" },
                { label: "Our Services", href: "#services" },
                { label: "Why Choose Us", href: "#why" },
                { label: "Patient Reviews", href: "#reviews" },
                { label: "Location", href: "#location" },
              ].map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-[var(--brand-cream)]/70 transition-colors hover:text-[var(--brand-gold-soft)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* credit line */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:flex-row">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-xs text-[var(--brand-cream)]/60 sm:text-left"
          >
            © {new Date().getFullYear()} City Hospital, Sigra, Varanasi. All
            rights reserved.
            <span className="mt-1 block sm:mt-0 sm:inline">
              {" "}
              Website designed &amp; built by{" "}
              <a
                href="https://www.prabhat.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 font-semibold text-[var(--brand-gold-soft)] underline decoration-[var(--brand-gold-soft)]/40 decoration-1 underline-offset-4 transition-all hover:text-white hover:decoration-white"
              >
                Prabhat Kumar
                <ExternalLink className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
              </a>{" "}
              <span className="text-[var(--brand-cream)]/45">· Web Developer</span>
            </span>
          </motion.p>

          <button
            onClick={scrollTop}
            aria-label="Back to top"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-[var(--brand-cream)] ring-1 ring-white/10 transition-all hover:bg-[var(--brand-gold)] hover:text-[#1a1308]"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
