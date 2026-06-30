"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteTrip,
  getMyTrips,
  searchTrips,
  filterTrips,
  getTripStats,
  getStatusAnalytics,
  Trip,
} from "@/lib/api";

const statusStyles: Record<Trip["status"], string> = {
  planned: "bg-amber-100 text-amber-800",
  ongoing: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
};

type StatusAnalytics = {
  planned: number;
  ongoing: number;
  completed: number;
};

function formatStatus(status: Trip["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchCity, setSearchCity] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [statusAnalytics, setStatusAnalytics] = useState<StatusAnalytics>({
    planned: 0,
    ongoing: 0,
    completed: 0,
  });

  const loadTrips = async () => {
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first to see your trips.");
      setIsLoading(false);
      router.push("/login");
      return;
    }

    try {
      const [tripList, stats, analytics] = await Promise.all([
        getMyTrips(token),
        getTripStats(token),
        getStatusAnalytics(token),
      ]);

      setTrips(tripList);
      setTotalTrips(stats.totalTrips);
      setTotalBudget(stats.totalBudget);
      setStatusAnalytics(analytics);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load trips right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (tripId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      router.push("/login");
      return;
    }

    try {
      setDeletingId(tripId);
      await deleteTrip(tripId, token);
      setTrips((prev) => prev.filter((trip) => trip._id !== tripId));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete trip right now.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const trimmedCity = searchCity.trim();
    if (!trimmedCity) {
      setError("Please enter a destination to search.");
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const results = await searchTrips(trimmedCity, token);
      setTrips(results);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to search trips right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setError("");
      setIsLoading(true);
      const results = await filterTrips(Number(minBudget), Number(maxBudget), token);
      setTrips(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchCity("");
    setMinBudget("");
    setMaxBudget("");
    loadTrips();
  };

  return (
    <main className="min-h-screen px-6 py-12 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Travel Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">My Trips</h1>
          </div>
          <button
            onClick={() => router.push("/create-trip")}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Create New Trip
          </button>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow">
            <p className="text-sm opacity-80">Total Trips</p>
            <h2 className="mt-2 text-3xl font-bold">{totalTrips}</h2>
          </div>
          <div className="rounded-2xl bg-emerald-600 p-6 text-white shadow">
            <p className="text-sm opacity-80">Total Budget</p>
            <h2 className="mt-2 text-3xl font-bold">
              ₹{totalBudget.toLocaleString()}
            </h2>
          </div>
          <div className="rounded-2xl bg-purple-600 p-6 text-white shadow">
            <p className="text-sm opacity-80">Completed Trips</p>
            <h2 className="mt-2 text-3xl font-bold">
              {statusAnalytics.completed}
            </h2>
          </div>
        </div>

<div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

  <h2 className="mb-5 text-xl font-bold">
    Trip Status Overview
  </h2>

  <div className="grid grid-cols-3 gap-4">

    <div className="rounded-xl bg-yellow-100 p-4 text-center">
      <h3 className="text-3xl font-bold">
        {statusAnalytics.planned}
      </h3>
      <p>Planned</p>
    </div>

    <div className="rounded-xl bg-blue-100 p-4 text-center">
      <h3 className="text-3xl font-bold">
        {statusAnalytics.ongoing}
      </h3>
      <p>Ongoing</p>
    </div>

    <div className="rounded-xl bg-green-100 p-4 text-center">
      <h3 className="text-3xl font-bold">
        {statusAnalytics.completed}
      </h3>
      <p>Completed</p>
    </div>

  </div>

</div>

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search by destination"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400"
            />
            <input
              type="number"
              placeholder="Min Budget"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400"
            />
            <input
              type="number"
              placeholder="Max Budget"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400"
            />
            <button
              onClick={handleSearch}
              type="button"
              className="rounded-xl bg-black text-white"
            >
              Search
            </button>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleFilter}
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-3 text-white"
            >
              Filter Budget
            </button>
            <button
              onClick={resetFilters}
              type="button"
              className="rounded-xl border px-5 py-3"
            >
              Reset
            </button>
          </div>
        </div>

        {error ? (
          <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-gray-600">Loading trips...</div>
        ) : null}

        {!isLoading && trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No trips yet</h2>
            <p className="mt-2 text-gray-600">Create your first trip to get started.</p>
          </div>
        ) : null}

        {!isLoading && trips.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {trips.map((trip) => (
              <article key={trip._id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{trip.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{trip.destination}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[trip.status]}`}
                  >
                    Status {formatStatus(trip.status)}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <p>Budget ₹{trip.budget}</p>
                  <p>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/my-trips/${trip._id}`)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-500"
                  >
                    View
                  </button>
                  <button
                    onClick={() => router.push(`/create-trip?edit=${trip._id}`)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    disabled={deletingId === trip._id}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {deletingId === trip._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
