"use client";

import {
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";

// ==========================================
// DESTINATIONS
// ==========================================

const destinations = [
  {
    city: "Goa",

    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",

    rating: "4.9",

    places: 120,
  },

  {
    city: "Manali",

    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",

    rating: "4.8",

    places: 95,
  },

  {
    city: "Jaipur",

    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",

    rating: "4.7",

    places: 80,
  },

  {
    city: "Delhi",

    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",

    rating: "4.6",

    places: 150,
  },
];

// ==========================================
// FALLBACK IMAGE
// ==========================================

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

// ==========================================
// COMPONENT
// ==========================================

export default function FeaturedDestinations() {
  const router = useRouter();

  return (
    <div
      id="destinations"
      className="scroll-mt-24"
    >

      <Section>

        <Container>

          {/* ==================================
              SECTION HEADER
          =================================== */}

          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">

            <div>

              <p className="font-semibold uppercase tracking-widest text-cyan-600">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
                Popular Destinations
              </h2>

              <p className="mt-3 max-w-xl text-slate-500">
                Discover popular destinations
                and start planning your next
                unforgettable journey.
              </p>

            </div>

            <Button variant="secondary">
              View All
            </Button>

          </div>

          {/* ==================================
              DESTINATION CARDS
          =================================== */}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {destinations.map(
              (
                destination,
                index
              ) => (

                <motion.div
                  key={
                    destination.city
                  }
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay:
                      index * 0.1,
                  }}
                  className="h-full"
                >

                  <Card className="h-full overflow-hidden p-0">

                    {/* =========================
                        IMAGE
                    ========================== */}

                    <div className="group relative overflow-hidden">

                      <img
                        src={
                          destination.image
                        }
                        alt={`${destination.city} travel destination`}
                        loading="lazy"
                        onError={(event) => {
                          const image =
                            event.currentTarget;

                          // Prevent infinite
                          // fallback attempts
                          image.onerror =
                            null;

                          image.src =
                            FALLBACK_IMAGE;
                        }}
                        className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* IMAGE OVERLAY */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* CITY INFORMATION */}

                      <div className="absolute bottom-5 left-5 right-5 text-white">

                        <h3 className="text-2xl font-bold">
                          {
                            destination.city
                          }
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-sm text-white/90">

                          <MapPin
                            size={16}
                          />

                          <span>
                            {
                              destination.places
                            }{" "}
                            Places
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* =========================
                        CARD FOOTER
                    ========================== */}

                    <div className="flex items-center justify-between p-5">

                      {/* RATING */}

                      <div className="flex items-center gap-2">

                        <Star
                          size={18}
                          className="fill-yellow-400 text-yellow-400"
                        />

                        <span className="font-bold text-slate-800">
                          {
                            destination.rating
                          }
                        </span>

                      </div>

                      {/* EXPLORE */}

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/recommendations/${encodeURIComponent(
                              destination.city
                            )}`
                          )
                        }
                        className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                      >

                        Explore

                        <ArrowRight
                          size={16}
                        />

                      </button>

                    </div>

                  </Card>

                </motion.div>

              )
            )}

          </div>

        </Container>

      </Section>

    </div>
  );
}