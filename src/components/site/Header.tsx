"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Star } from "lucide-react";
import { hospital } from "@/lib/data";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over the dark hero: light text, transparent bg, glassy ring on scroll
  // After hero (scrolled): glass bg, dark text
  const onHero = !scrolled;

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--brand-teal)]/10 glass"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
        <a href="#top" className="flex items-center gap-2.5" aria-label="City Hospital home">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg font-[var(--font-fraunces)] text-sm font-semibold transition-colors duration-300 ${
              onHero
                ? "bg-[var(--brand-cream)]/15 text-[var(--brand-cream)] ring-1 ring-white/20 backdrop-blur-sm"
                : "bg-[var(--brand-teal)] text-[var(--brand-cream)]"
            }`}
          >
            C
          </div>
          <div className="leading-none">
            <div
              className={`font-[var(--font-fraunces)] text-base font-medium transition-colors duration-300 ${
                onHero ? "text-[var(--brand-cream)]" : "text-[var(--brand-teal-ink)]"
              }`}
            >
              City Hospital
            </div>
            <div
              className={`flex items-center gap-1 text-[0.7rem] transition-colors duration-300 ${
                onHero ? "text-[var(--brand-cream)]/70" : "text-[var(--muted-foreground)]"
              }`}
            >
              <Star className="h-2.5 w-2.5 fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
              {hospital.rating} · Open 24h
            </div>
          </div>
        </a>

        <nav
          className={`hidden items-center gap-7 text-sm font-medium transition-colors duration-300 md:flex ${
            onHero
              ? "text-[var(--brand-cream)]/85"
              : "text-[var(--brand-teal-deep)]"
          }`}
        >
          <a href="#specialist" className="transition-colors hover:opacity-70">
            Specialist
          </a>
          <a href="#services" className="transition-colors hover:opacity-70">
            Services
          </a>
          <a href="#reviews" className="transition-colors hover:opacity-70">
            Reviews
          </a>
          <a href="#location" className="transition-colors hover:opacity-70">
            Location
          </a>
        </nav>

        <a
          href={`tel:${hospital.phoneTel}`}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            onHero
              ? "bg-[var(--brand-gold)] text-[#1a1308] hover:brightness-105"
              : "bg-[var(--brand-teal)] text-[var(--brand-cream)] hover:bg-[var(--brand-teal-deep)]"
          }`}
          aria-label="Call City Hospital now"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Call Now</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </motion.header>
  );
}
