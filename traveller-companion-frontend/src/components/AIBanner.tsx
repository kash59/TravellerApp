"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function AIBanner() {
  const router = useRouter();

  return (
    <Section>

      <Container>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-10 text-white shadow-2xl lg:p-16"
        >

          {/* Background Circles */}

          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">

            <div>

              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">

                <Sparkles size={18} />

                AI Powered

              </div>

              <h2 className="text-4xl font-extrabold leading-tight lg:text-5xl">

                Let AI Plan

                <br />

                Your Entire Trip

              </h2>

              <p className="mt-6 max-w-xl text-lg text-cyan-100">

                Generate personalized itineraries,
                discover hidden gems,
                optimize your travel budget,
                and enjoy a smarter journey.

              </p>

              <Button
                className="mt-8 bg-white text-cyan-700 hover:bg-slate-100"
                onClick={() => router.push("/my-trips")}
              >

                Try AI Planner

                <ArrowRight size={18} />

              </Button>

            </div>

            <div className="flex justify-center">

              <div className="rounded-[32px] bg-white/15 p-8 backdrop-blur-xl">

                <img
                  src="https://cdn-icons-png.flaticon.com/512/201/201623.png"
                  alt="AI Planner"
                  className="h-64 w-64 object-contain"
                />

              </div>

            </div>

          </div>

        </motion.div>

      </Container>

    </Section>
  );
}