"use client";

import { Star, ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";

const destinations = [
  {
    city: "Goa",
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200",
    rating: "4.9",
    places: 120,
  },
  {
    city: "Manali",
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200",
    rating: "4.8",
    places: 95,
  },
  {
    city: "Jaipur",
    image:
      "https://images.unsplash.com/photo-1599661046827-dacde6976548?w=1200",
    rating: "4.7",
    places: 80,
  },
  {
    city: "Delhi",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200",
    rating: "4.6",
    places: 150,
  },
];

export default function FeaturedDestinations() {
  const router = useRouter();

  return (
    <Section>

      <Container>

        <div className="mb-12 flex items-center justify-between">

          <div>

            <p className="text-cyan-600 font-semibold uppercase tracking-widest">
              Explore
            </p>

            <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
              Popular Destinations
            </h2>

          </div>

          <Button variant="secondary">
            View All
          </Button>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {destinations.map((destination, index) => (

            <motion.div
              key={destination.city}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >

              <Card className="overflow-hidden p-0">

                <div className="relative">

                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="h-72 w-full object-cover transition duration-500 hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-5 left-5 text-white">

                    <h3 className="text-2xl font-bold">
                      {destination.city}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">

                      <MapPin size={16} />

                      {destination.places} Places

                    </div>

                  </div>

                </div>

                <div className="flex items-center justify-between p-5">

                  <div className="flex items-center gap-2">

                    <Star
                      size={18}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold">
                      {destination.rating}
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/recommendations/${destination.city}`
                      )
                    }
                    className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
                  >
                    Explore
                    <ArrowRight size={16} />
                  </button>

                </div>

              </Card>

            </motion.div>

          ))}

        </div>

      </Container>

    </Section>
  );
}