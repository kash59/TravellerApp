"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Search,
  MapPin,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function DestinationSearch() {
  const router = useRouter();

  const [destination, setDestination] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSearch = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const city = destination.trim();

    if (!city) {
      setError(
        "Please enter a destination."
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      // Search destination using our backend
      const response = await fetch(
        `${API_URL}/destinations/search?city=${encodeURIComponent(
          city
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Destination not found."
        );
      }

      // Use the normalized city name
      const cityName =
        data.name || city;

      const latitude =
        data.location.latitude;

      const longitude =
        data.location.longitude;

      // Navigate to recommendation page
      // Coordinates are included for dynamic cities

      router.push(
        `/recommendations/${encodeURIComponent(
          cityName
        )}?lat=${latitude}&lng=${longitude}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to search destination."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">

      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:flex-row"
      >

        <div className="flex flex-1 items-center gap-3 px-3">

          <MapPin
            size={22}
            className="shrink-0 text-cyan-600"
          />

          <input
            type="text"
            value={destination}
            onChange={(event) => {
              setDestination(
                event.target.value
              );

              if (error) {
                setError("");
              }
            }}
            placeholder="Search Agra, Mumbai, Shimla..."
            className="w-full bg-transparent py-3 text-slate-900 outline-none placeholder:text-slate-400"
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >

          {loading ? (
            <>
              <Loader2
                size={19}
                className="animate-spin"
              />

              Searching...
            </>
          ) : (
            <>
              <Search size={19} />

              Explore
            </>
          )}

        </button>

      </form>

      {error && (
        <p className="mt-3 text-center text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      <p className="mt-3 text-center text-sm text-slate-500">
        Try Goa, Manali, Jaipur, Delhi,
        Agra or Shimla
      </p>

    </div>
  );
}