import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

import FeaturedDestinations from "@/components/FeaturedDestinations";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedDestinations />
    </>
  );
}