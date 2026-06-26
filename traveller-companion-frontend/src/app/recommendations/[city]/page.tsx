"use client";

import { use, useEffect, useState } from "react";

interface City {
  _id: string;
  name: string;
  description: string;
  hotels: string[];
  places: string[];
  foods: string[];
}

export default function RecommendationPage({
  params,
}: {
  params: Promise< { city: string }>;
}) {
  const { city } = use(params);
  const [cityData, setCityData] = useState<City | null>(null);

  useEffect(() => {
    fetchCity();
  }, []);

  const fetchCity = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/cities/recommendations?destination=${city}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCityData(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!cityData) {
    return <h1 className="p-10">Loading...</h1>;
  }

  return (
    <div className="mx-auto max-w-6xl p-10">
      <h1 className="mb-4 text-5xl font-bold">{cityData.name}</h1>
      <p className="mb-8 text-gray-600">{cityData.description}</p>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <h2 className="mb-3 text-2xl font-bold">Hotels</h2>
          {cityData.hotels.map((hotel: string) => (
            <p key={hotel}>{hotel}</p>
          ))}
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="mb-3 text-2xl font-bold">Places</h2>
          {cityData.places.map((place :string) => (
            <p key={place}>{place}</p>
          ))}
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="mb-3 text-2xl font-bold">Foods</h2>
          {cityData.foods.map((food: string) => (
            <p key={food}>{food}</p>
          ))}
        </div>
      </div>
    </div>
  );
}