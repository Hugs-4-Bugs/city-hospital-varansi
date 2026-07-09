"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { hospital } from "@/lib/data";
import { WhatsAppIcon } from "./CTABanner";

export default function MobileActionBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 560);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed inset-x-0 bottom-0 z-50 flex gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden"
        >
          <div className="flex w-full overflow-hidden rounded-2xl shadow-lift ring-1 ring-black/5">
            <a
              href={`tel:${hospital.phoneTel}`}
              className="flex flex-1 items-center justify-center gap-2 bg-[var(--brand-teal)] py-3.5 text-sm font-semibold text-[var(--brand-cream)] active:bg-[var(--brand-teal-deep)]"
              aria-label="Call City Hospital now"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
            <a
              href={`https://wa.me/${hospital.whatsapp}?text=${encodeURIComponent(
                "Hello City Hospital, I'd like to know more about your services."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 bg-[#25D366] py-3.5 text-sm font-semibold text-[#04210f] active:brightness-95"
              aria-label="Chat with City Hospital on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
