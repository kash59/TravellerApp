"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const stats = [
  {
    number: "500+",
    title: "Trips Planned",
  },
  {
    number: "120+",
    title: "Destinations",
  },
  {
    number: "4.9★",
    title: "User Rating",
  },
  {
    number: "24/7",
    title: "AI Assistance",
  },
];

export default function Stats() {
  return (
    <Section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">

      <Container>

        <div className="grid gap-10 text-center md:grid-cols-4">

          {stats.map((stat, index) => (

            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >

              <h2 className="text-5xl font-extrabold">
                {stat.number}
              </h2>

              <p className="mt-3 text-cyan-100">
                {stat.title}
              </p>

            </motion.div>

          ))}

        </div>

      </Container>

    </Section>
  );
}