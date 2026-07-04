import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import AIBanner from "@/components/AIBanner";
import WhyChooseUs from "@/components/WhyChooseUS";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedDestinations />
      <AIBanner />
      <WhyChooseUs />
      <Stats />
      <Testimonials />
      <Footer />
    </>
  );
}