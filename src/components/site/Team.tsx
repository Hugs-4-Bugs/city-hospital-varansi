"use client";

import { motion } from "framer-motion";
import { hospital } from "@/lib/data";
import SectionHeading from "./SectionHeading";

export default function Team() {
  return (
    <section
      id="team"
      className="relative bg-gradient-to-b from-[var(--brand-cream)] to-[var(--brand-mist)] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="Meet the Team"
          title={
            <>
              Specialists who actually{" "}
              <span className="gradient-text-teal">show up.</span>
            </>
          }
          subtitle="City Hospital's multi-specialty OPD is staffed by experienced consultants across gynaecology, medicine, orthopedics and critical care."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hospital.team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40, rotateX: -10, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.08,
              }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-2xl p-6 ring-1 transition-all duration-300 ${
                member.highlight
                  ? "bg-[var(--brand-teal-ink)] text-[var(--brand-cream)] ring-white/10 shadow-lift"
                  : "bg-white text-[var(--brand-teal-ink)] ring-[var(--brand-teal)]/8 hover:shadow-soft"
              }`}
              data-cursor="hover"
            >
              {member.highlight && (
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-gold)]/20 blur-3xl" aria-hidden />
              )}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 14 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-[var(--font-fraunces)] text-lg font-semibold ${
                      member.highlight
                        ? "bg-[var(--brand-gold)] text-[#1a1308]"
                        : "bg-[var(--brand-teal)]/10 text-[var(--brand-teal)]"
                    }`}
                  >
                    {member.name.split(" ").slice(-1)[0].charAt(0)}
                  </motion.div>
                  {member.highlight && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.4 }}
                      className="rounded-full bg-[var(--brand-gold)]/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-[var(--brand-gold-soft)]"
                    >
                      Lead
                    </motion.span>
                  )}
                </div>
                <h3 className="mt-4 font-[var(--font-fraunces)] text-lg font-semibold leading-tight">
                  {member.name}
                </h3>
                <div
                  className={`mt-1 text-sm font-medium ${
                    member.highlight
                      ? "text-[var(--brand-gold-soft)]"
                      : "text-[var(--brand-teal)]"
                  }`}
                >
                  {member.role}
                </div>
                <p
                  className={`mt-3 text-xs leading-relaxed ${
                    member.highlight
                      ? "text-[var(--brand-cream)]/70"
                      : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {member.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
