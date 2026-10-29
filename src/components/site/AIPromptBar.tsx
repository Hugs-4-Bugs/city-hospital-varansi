"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, ArrowUpRight, X, Loader2 } from "lucide-react";
import { hospital, aiPrompt } from "@/lib/data";

type AIPlatform = {
  id: string;
  name: string;
  color: string;
  bg: string;
  textColor: string;
  url: (prompt: string) => string;
  note: string;
};

const platforms: AIPlatform[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    color: "#10a37f",
    bg: "rgba(16,163,127,0.12)",
    textColor: "#0d7d63",
    url: (p) => `https://chat.openai.com/?q=${encodeURIComponent(p)}`,
    note: "Works without an account",
  },
  {
    id: "gemini",
    name: "Gemini",
    color: "#4285f4",
    bg: "rgba(66,133,244,0.12)",
    textColor: "#1a56c4",
    url: (p) => `https://gemini.google.com/app?prompt=${encodeURIComponent(p)}`,
    note: "Google sign-in may be asked",
  },
  {
    id: "claude",
    name: "Claude",
    color: "#d97757",
    bg: "rgba(217,119,87,0.14)",
    textColor: "#a04a2e",
    url: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
    note: "Free account needed",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "#20808d",
    bg: "rgba(32,128,141,0.14)",
    textColor: "#155962",
    url: (p) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
    note: "Live web search, no login",
  },
];

function PlatformIcon({ id, className = "" }: { id: string; className?: string }) {
  switch (id) {
    case "chatgpt":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.78.78 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.408 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v3l-2.597 1.5-2.607-1.5z" />
        </svg>
      );
    case "gemini":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12z" />
        </svg>
      );
    case "claude":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M4.709 15.955l4.72-2.647.079-.23-.079-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 12.118l.055-.352.48-.321.686.058 1.03.073 1.519.115 1.422.097 2.34.146h1.03l.079-.073.072-.024-.072-.262-.731-1.802-1.158-2.59-1.244-2.62-.516-.938-.268-.422-.072-.274.158-.121 1.158.073 1.682.085 2.5.115 1.814.103 1.244.085 1.157-.085.073-.073v-.262l-.157-.665-.547-1.62-.434-1.188-.358-.962-.157-.435-.072-.262.072-.073h.395l.547.395 1.282 1.488 1.708 1.953 1.489 1.671.864.86.182.122h.158V9.05l.121-1.738.218-2.592.157-1.922.078-.595.097-.435.158-.073.358.073.547.435.82 1.066.982 1.519.686 1.157.422.69.182.483-.072.121-.268-.182-.48-.049-1.157-.182-2.595-.358-2.81-.049-1.488.058-1.067.072-.69v-.426l.182-.243h.395l1.519.434 2.044.726 2.591 1.115 1.488.79 1.984 1.106 1.367 1.115 1.066.86.547.465.157.122-.078.121.547.268-.157.073-.157.218-.422.346-.395.073-.434-.073-.078-.218-.157-.434-.072-.218v-.434l.157-.434.072-.434.078-.434-.078-.218-.078-.073z" />
        </svg>
      );
    case "perplexity":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M12 0L1 9.18v6.32L7.83 21.5V11.59l4.17-3.5 4.17 3.5v9.91L23 15.5V9.18L12 0zM9.91 13.18v8.91L12 23.91l2.09-1.82v-8.91L12 11.36l-2.09 1.82z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AIPromptBar() {
  const [launching, setLaunching] = useState<AIPlatform | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Launch directly to the AI platform. The prompt is sent in the URL query
  // string, so the user lands on the AI with the prompt already typed in.
  // The prompt text itself is never rendered visibly on the page.
  const launch = (platform: AIPlatform) => {
    setLaunching(platform);
    window.open(platform.url(aiPrompt), "_blank", "noopener,noreferrer");
    setTimeout(() => setLaunching(null), 1600);
    setMobileOpen(false);
  };

  return (
    <section
      id="ask-ai"
      className="relative overflow-hidden bg-[var(--brand-teal-ink)] py-20 text-[var(--brand-cream)] sm:py-28"
    >
      {/* animated bg */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-20" aria-hidden />
      <motion.div
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[var(--brand-teal)]/40 blur-3xl"
        animate={reduce ? {} : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-[var(--brand-gold)]/15 blur-3xl"
        animate={reduce ? {} : { x: [0, -24, 0], y: [0, 24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div ref={containerRef} className="relative mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold-soft)] ring-1 ring-white/15"
          >
            <motion.span
              animate={reduce ? {} : { rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            Ask AI about us
          </motion.div>

          <h2 className="text-balance font-[var(--font-fraunces)] text-3xl font-light leading-[1.1] sm:text-4xl lg:text-6xl">
            Want a second opinion?{" "}
            <span className="gradient-text-gold">Ask any AI about City Hospital.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--brand-cream)]/75 sm:text-lg">
            Tap your favourite AI below. We'll open it with everything already
            typed: our address, phone, rating, specialists and what patients say.
            Just hit send to get a complete, AI-researched summary of City Hospital.
          </p>
        </motion.div>

        {/* Platform launch cards (no prompt visible anywhere) */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
          }}
          className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {platforms.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => launch(p)}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl bg-white/[0.05] p-4 text-center ring-1 ring-white/10 transition-colors hover:bg-white/[0.1] sm:p-5"
              data-cursor="hover"
              aria-label={`Ask ${p.name} about City Hospital`}
            >
              {/* glow on hover */}
              <motion.span
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${p.bg} 0%, transparent 70%)`,
                }}
                aria-hidden
              />
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.12 }}
                transition={{ duration: 0.5 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: p.bg, color: p.color }}
              >
                <PlatformIcon id={p.id} className="h-6 w-6" />
              </motion.div>
              <span className="relative text-sm font-semibold text-[var(--brand-cream)]">
                {p.name}
              </span>
              <span className="relative text-[0.65rem] leading-snug text-[var(--brand-cream)]/50">
                {p.note}
              </span>
              <ArrowUpRight className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-[var(--brand-gold-soft)] opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          ))}
        </motion.div>

        {/* Mobile fallback trigger (hidden on desktop) */}
        <div className="mt-6 text-center sm:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-gold)] px-5 py-2.5 text-sm font-semibold text-[#1a1308]"
          >
            <Sparkles className="h-4 w-4" />
            Choose your AI
          </button>
        </div>
      </div>

      {/* Launching toast */}
      <AnimatePresence>
        {launching && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2"
          >
            <div className="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lift">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: launching.bg, color: launching.color }}
              >
                <PlatformIcon id={launching.id} className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold text-[var(--brand-teal-ink)]">
                Opening {launching.name}...
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-teal)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile platform sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded-t-3xl bg-[var(--brand-teal-ink)] p-6 text-[var(--brand-cream)] ring-1 ring-white/10"
            >
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-[var(--font-fraunces)] text-xl font-medium">
                  Pick an AI to ask
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-[var(--brand-cream)]/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => launch(p)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white/[0.05] p-3 text-left ring-1 ring-white/10 transition-colors hover:bg-white/[0.1]"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: p.bg, color: p.color }}
                    >
                      <PlatformIcon id={p.id} className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-[0.7rem] text-[var(--brand-cream)]/55">
                        {p.note}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[var(--brand-gold-soft)]" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
