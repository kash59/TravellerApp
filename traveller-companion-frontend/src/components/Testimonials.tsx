"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

const reviews = [
  {
    name: "Aarav Sharma",
    review:
      "Traveller Companion helped me plan my Goa trip in minutes. The AI itinerary was surprisingly accurate!",
  },
  {
    name: "Priya Verma",
    review:
      "Loved the recommendations and budget planner. It saved me a lot of time.",
  },
  {
    name: "Rahul Mehta",
    review:
      "One of the best travel planning apps I've used. Clean UI and useful AI features.",
  },
];

export default function Testimonials() {
  return (
    <Section>

      <Container>

        <div className="mb-12 text-center">

          <p className="font-semibold uppercase tracking-widest text-cyan-600">
            Testimonials
          </p>

          <h2 className="mt-3 text-5xl font-extrabold">
            Loved by Travelers
          </h2>

        </div>

        <div className="grid gap-8 md:grid-cols-3">

          {reviews.map((review, index) => (

            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >

              <Card>

                <div className="mb-5 text-yellow-500 text-xl">
                  ⭐⭐⭐⭐⭐
                </div>

                <p className="text-slate-600">
                  "{review.review}"
                </p>

                <h3 className="mt-6 font-bold text-slate-900">
                  {review.name}
                </h3>

              </Card>

            </motion.div>

          ))}

        </div>

      </Container>

    </Section>
  );
}