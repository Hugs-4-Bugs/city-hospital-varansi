"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useMotionValue, useSpring } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lazy init avoids setState-in-effect lint and SSR mismatch.
  const [mounted] = useState(() => typeof window !== "undefined");
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { damping: 28, stiffness: 380, mass: 0.4 });
  const springY = useSpring(cursorY, { damping: 28, stiffness: 380, mass: 0.4 });
  const [hovering, setHovering] = useState(false);
  const [isTouch] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(pointer: coarse)").matches;
  });

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
    };
  }, []);

  // Custom cursor (desktop only)
  useEffect(() => {
    if (!mounted || isTouch) return;
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      const target = e.target as HTMLElement;
      setHovering(
        !!target.closest("a, button, [data-cursor='hover'], input, textarea")
      );
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mounted, isTouch, cursorX, cursorY]);

  return (
    <>
      {children}
      {!isTouch && mounted && (
        <>
          {/* Outer ring (spring-followed) */}
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
            style={{ x: springX, y: springY }}
          >
            <motion.div
              animate={{ scale: hovering ? 1.6 : 1, opacity: hovering ? 0.9 : 0.5 }}
              transition={{ duration: 0.25 }}
              className="-ml-3 -mt-3 h-6 w-6 rounded-full border border-[var(--brand-teal)]"
            />
          </motion.div>
          {/* Inner dot (instant) */}
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
            style={{ x: cursorX, y: cursorY }}
          >
            <motion.div
              animate={{ scale: hovering ? 0.5 : 1 }}
              transition={{ duration: 0.2 }}
              className="-ml-1 -mt-1 h-2 w-2 rounded-full bg-[var(--brand-teal)]"
            />
          </motion.div>
        </>
      )}
    </>
  );
}
