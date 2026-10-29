import dynamic from "next/dynamic";
import SmoothScroll from "@/components/site/SmoothScroll";
import { ScrollProgress } from "@/components/site/Motion";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import TrustBar from "@/components/site/TrustBar";
import Specialist from "@/components/site/Specialist";

// Lazy-load below-the-fold sections to reduce initial JS bundle
const MaternityShowcase = dynamic(() => import("@/components/site/MaternityShowcase"));
const Facilities = dynamic(() => import("@/components/site/Facilities"));
const Services = dynamic(() => import("@/components/site/Services"));
const CinematicPin = dynamic(() => import("@/components/site/CinematicPin"));
const WhyChoose = dynamic(() => import("@/components/site/WhyChoose"));
const Team = dynamic(() => import("@/components/site/Team"));
const Reviews = dynamic(() => import("@/components/site/Reviews"));
const AIPromptBar = dynamic(() => import("@/components/site/AIPromptBar"));
const Location = dynamic(() => import("@/components/site/Location"));
const CTABanner = dynamic(() => import("@/components/site/CTABanner"));
const Footer = dynamic(() => import("@/components/site/Footer"));
const MobileActionBar = dynamic(() => import("@/components/site/MobileActionBar"));

export default function Home() {
  return (
    <SmoothScroll>
      <ScrollProgress />
      <div id="top" className="relative flex min-h-screen flex-col bg-[var(--brand-cream)]">
        <Header />
        <main className="flex-1">
          <Hero />
          <TrustBar />
          <Specialist />
          <MaternityShowcase />
          <Facilities />
          <Services />
          <CinematicPin />
          <WhyChoose />
          <Team />
          <Reviews />
          <AIPromptBar />
          <Location />
          <CTABanner />
        </main>
        <Footer />
        <MobileActionBar />
      </div>
    </SmoothScroll>
  );
}
