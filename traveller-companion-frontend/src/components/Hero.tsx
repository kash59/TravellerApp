"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [city, setCity] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (!city.trim()) return;

    router.push(`/recommendations/${city}`);
  };

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6">

      <h1 className="text-5xl md:text-7xl font-bold text-center">
        Explore Your Next
        <br />
        Adventure
      </h1>

      <p className="mt-6 text-lg text-gray-500 text-center max-w-xl">
        Discover amazing destinations, create trips,
        and get personalized travel recommendations.
      </p>

      <div className="mt-8 flex gap-4">
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border rounded-xl px-5 py-4 w-80"
        />

        <button
          onClick={handleSearch}
          className="bg-black text-white px-6 py-4 rounded-xl"
        >
          Search
        </button>
      </div>

    </section>
  );
}