import SmoothScroll from "@/components/site/SmoothScroll";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import TrustBar from "@/components/site/TrustBar";
import Specialist from "@/components/site/Specialist";
import Services from "@/components/site/Services";
import WhyChoose from "@/components/site/WhyChoose";
import Reviews from "@/components/site/Reviews";
import Location from "@/components/site/Location";
import CTABanner from "@/components/site/CTABanner";
import Footer from "@/components/site/Footer";
import MobileActionBar from "@/components/site/MobileActionBar";

export default function Home() {
  return (
    <SmoothScroll>
      <div id="top" className="relative flex min-h-screen flex-col bg-[var(--brand-cream)]">
        <Header />
        <main className="flex-1">
          <Hero />
          <TrustBar />
          <Specialist />
          <Services />
          <WhyChoose />
          <Reviews />
          <Location />
          <CTABanner />
        </main>
        <Footer />
        <MobileActionBar />
      </div>
    </SmoothScroll>
  );
}
