"use client";

import { useState } from "react";
import { generateItinerary } from "@/lib/api";

export default function AIItineraryPage() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");

  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setItinerary("");

    if (!destination || !budget || !days) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const data = await generateItinerary(
        destination,
        Number(budget),
        Number(days)
      );

      setItinerary(data.itinerary);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate itinerary."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">

        <h1 className="mb-8 text-3xl font-bold">
          AI Trip Planner
        </h1>

        <div className="grid gap-4 md:grid-cols-3">

          <input
            placeholder="Destination"
            className="rounded border p-3"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />

          <input
            type="number"
            placeholder="Budget"
            className="rounded border p-3"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          <input
            type="number"
            placeholder="Days"
            className="rounded border p-3"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />

        </div>

        <button
          onClick={handleGenerate}
          className="mt-6 rounded bg-black px-6 py-3 text-white"
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>

        {error && (
          <div className="mt-6 rounded bg-red-100 p-4 text-red-600">
            {error}
          </div>
        )}

        {itinerary && (
          <div className="mt-8 rounded bg-gray-50 p-6">
            <h2 className="mb-4 text-2xl font-bold">
              Your AI Itinerary
            </h2>

            <pre className="whitespace-pre-wrap text-gray-700">
              {itinerary}
            </pre>
          </div>
        )}

      </div>
    </main>
  );
}