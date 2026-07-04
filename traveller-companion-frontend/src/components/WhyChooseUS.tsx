"use client";

import { Brain, MapPinned, Wallet, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const features = [
  {
    icon: Brain,
    title: "AI Itineraries",
    description:
      "Generate personalized travel plans in seconds using Gemini AI.",
  },
  {
    icon: MapPinned,
    title: "Smart Recommendations",
    description:
      "Discover the best attractions, hotels and local experiences.",
  },
  {
    icon: Wallet,
    title: "Budget Planning",
    description:
      "Manage your travel budget and plan affordable trips easily.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "Your trips and travel information are securely stored.",
  },
];

export default function WhyChooseUs() {
  return (
    <Section>

      <Container>

        <div className="text-center mb-14">

          <p className="font-semibold uppercase tracking-widest text-cyan-600">
            Why Choose Us
          </p>

          <h2 className="mt-3 text-5xl font-extrabold text-slate-900">
            Travel Smarter with AI
          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="text-center">

                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100">

                    <Icon className="text-cyan-700" size={32} />

                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-slate-600">
                    {feature.description}
                  </p>

                </Card>
              </motion.div>
            );
          })}

        </div>

      </Container>

    </Section>
  );
}