import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedDestinations from "@/components/FeaturedDestinations";
import AIBanner from "@/components/AIBanner";
import WhyChooseUs from "@/components/WhyChooseUS";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import DestinationSearch from "@/components/DestinationSearch";



export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      {/* DESTINATION SEARCH */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6 text-center">
            <p className="font-semibold uppercase tracking-widest text-cyan-600">
              Find Your Next Adventure
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Where do you want to go?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-500">
              Search for a destination and start exploring.
            </p>
          </div>

          <DestinationSearch />

        </div>
      </section>

      <FeaturedDestinations />

      <WhyChooseUs />

      <Testimonials />

      <Footer />
    </>
  );
}
