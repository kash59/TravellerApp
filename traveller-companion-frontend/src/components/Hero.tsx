"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Input from "@/components/ui/Input";
import Section from "@/components/ui/Section";

export default function Hero() {
  const [city, setCity] = useState("");

  const router = useRouter();

  const handleSearch = () => {
    if (!city.trim()) return;

    router.push(`/recommendations/${city}`);
  };

  return (
    <Section className="relative overflow-hidden">

      {/* Background */}

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-50 via-white to-blue-100" />

      <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />

      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />

      <Container>

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >

            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-cyan-700">

              <Sparkles size={18} />

              AI Powered Travel Planner

            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-slate-900 lg:text-7xl">

              Discover

              <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">

                Your Next Adventure

              </span>

            </h1>

            <p className="mt-8 text-lg leading-8 text-slate-600">

              Create trips, explore destinations,
              generate AI itineraries and travel smarter
              with Traveller Companion.

            </p>

            {/* Search */}

            <Card className="mt-10">

              <div className="flex flex-col gap-4 md:flex-row">

                <div className="flex-1">

                  <Input
                    placeholder="Search destination..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />

                </div>

                <Button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2"
                >

                  <Search size={18} />

                  Explore

                </Button>

              </div>

            </Card>

          </motion.div>

          {/* Right */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >

            <div className="relative">

              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900"
                alt="Travel"
                className="h-[600px] w-full rounded-[40px] object-cover shadow-2xl"
              />

              {/* Floating Card */}

              <Card className="absolute bottom-8 left-8 w-72">

                <div className="flex items-center gap-3">

                  <MapPin className="text-cyan-600" />

                  <div>

                    <h3 className="font-bold">

                      Goa

                    </h3>

                    <p className="text-sm text-slate-500">

                      Trending Destination

                    </p>

                  </div>

                </div>

              </Card>

            </div>

          </motion.div>

        </div>

      </Container>

    </Section>
  );
}