"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Star } from "lucide-react";
import { hospital } from "@/lib/data";

export default function Header() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 480);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.header
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 top-0 z-40 border-b border-[var(--brand-teal)]/10 glass"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
            <a href="#top" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-teal)] font-[var(--font-fraunces)] text-sm font-semibold text-[var(--brand-cream)]">
                C
              </div>
              <div className="leading-none">
                <div className="font-[var(--font-fraunces)] text-base font-medium text-[var(--brand-teal-ink)]">
                  City Hospital
                </div>
                <div className="flex items-center gap-1 text-[0.7rem] text-[var(--muted-foreground)]">
                  <Star className="h-2.5 w-2.5 fill-[var(--brand-gold)] text-[var(--brand-gold)]" />
                  {hospital.rating} · Open 24h
                </div>
              </div>
            </a>

            <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--brand-teal-deep)] md:flex">
              <a href="#specialist" className="transition-colors hover:text-[var(--brand-teal)]">
                Specialist
              </a>
              <a href="#services" className="transition-colors hover:text-[var(--brand-teal)]">
                Services
              </a>
              <a href="#reviews" className="transition-colors hover:text-[var(--brand-teal)]">
                Reviews
              </a>
              <a href="#location" className="transition-colors hover:text-[var(--brand-teal)]">
                Location
              </a>
            </nav>

            <a
              href={`tel:${hospital.phoneTel}`}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-4 py-2 text-sm font-semibold text-[var(--brand-cream)] transition-colors hover:bg-[var(--brand-teal-deep)]"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">Call Now</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
