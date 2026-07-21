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
  planned: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ongoing: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  completed:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

type StatusAnalytics = {
  planned: number;
  ongoing: number;
  completed: number;
};

function formatStatus(status: Trip["status"]) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

export default function MyTripsPage() {
  const router = useRouter();

  // ==========================================
  // STATE
  // ==========================================

  const [trips, setTrips] =
    useState<Trip[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [searchCity, setSearchCity] =
    useState("");

  const [minBudget, setMinBudget] =
    useState("");

  const [maxBudget, setMaxBudget] =
    useState("");

  const [totalTrips, setTotalTrips] =
    useState(0);

  const [totalBudget, setTotalBudget] =
    useState(0);

  const [
    statusAnalytics,
    setStatusAnalytics,
  ] = useState<StatusAnalytics>({
    planned: 0,
    ongoing: 0,
    completed: 0,
  });

  // ==========================================
  // LOAD TRIPS
  // ==========================================

  const loadTrips = async () => {
    setError("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login first to see your trips."
      );

      setIsLoading(false);

      router.push("/login");

      return;
    }

    try {
      setIsLoading(true);

      const [
        tripList,
        stats,
        analytics,
      ] = await Promise.all([
        getMyTrips(token),
        getTripStats(token),
        getStatusAnalytics(token),
      ]);

      setTrips(tripList);

      setTotalTrips(
        stats.totalTrips
      );

      setTotalBudget(
        stats.totalBudget
      );

      setStatusAnalytics(
        analytics
      );
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Unable to load trips right now.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (
    tripId: string
  ) => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login first."
      );

      router.push("/login");

      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this trip?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(tripId);

      await deleteTrip(
        tripId,
        token
      );

      // Reload so statistics update too
      await loadTrips();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete trip right now.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      return;
    }

    const trimmedCity =
      searchCity.trim();

    if (!trimmedCity) {
      setError(
        "Please enter a destination to search."
      );

      return;
    }

    try {
      setError("");

      setIsLoading(true);

      const results =
        await searchTrips(
          trimmedCity,
          token
        );

      setTrips(results);
    } catch (searchError) {
      const message =
        searchError instanceof Error
          ? searchError.message
          : "Unable to search trips right now.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const handleFilter = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      return;
    }

    if (!minBudget && !maxBudget) {
      setError(
        "Enter a minimum or maximum budget."
      );

      return;
    }

    try {
      setError("");

      setIsLoading(true);

      const results =
        await filterTrips(
          Number(minBudget || 0),
          Number(
            maxBudget ||
              Number.MAX_SAFE_INTEGER
          ),
          token
        );

      setTrips(results);
    } catch (filterError) {
      const message =
        filterError instanceof Error
          ? filterError.message
          : "Unable to filter trips right now.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetFilters = () => {
    setSearchCity("");

    setMinBudget("");

    setMaxBudget("");

    loadTrips();
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 md:px-8 md:py-12">

      <div className="mx-auto w-full max-w-6xl">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              Travel Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
              My Trips
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your journeys,
              budgets and travel plans.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/create-trip"
              )
            }
            className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            + Create New Trip
          </button>

        </div>

        {/* =====================================
            MAIN STATS
        ====================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL TRIPS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Trips
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {totalTrips}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                ✈️
              </div>

            </div>

          </div>

          {/* TOTAL BUDGET */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Budget
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  ₹
                  {totalBudget.toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                💰
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Completed Trips
                </p>

                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {
                    statusAnalytics.completed
                  }
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                ✓
              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            STATUS OVERVIEW
        ====================================== */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-slate-900">
              Trip Status Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track the current status of
              all your journeys.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            {/* PLANNED */}

            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-amber-700">
                    Planned
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {
                      statusAnalytics.planned
                    }
                  </p>

                </div>

                <span className="text-xl">
                  🗓️
                </span>

              </div>

            </div>

            {/* ONGOING */}

            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-blue-700">
                    Ongoing
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {
                      statusAnalytics.ongoing
                    }
                  </p>

                </div>

                <span className="text-xl">
                  🚗
                </span>

              </div>

            </div>

            {/* COMPLETED */}

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-emerald-700">
                    Completed
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {
                      statusAnalytics.completed
                    }
                  </p>

                </div>

                <span className="text-xl">
                  🏆
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            SEARCH + FILTERS
        ====================================== */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="font-bold text-slate-900">
              Find Your Trips
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search by destination or
              filter by your travel budget.
            </p>

          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">

            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search destination..."
              value={searchCity}
              onChange={(e) =>
                setSearchCity(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  handleSearch();
                }
              }}
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500"
            />

            {/* MIN */}

            <input
              type="number"
              placeholder="Min budget"
              value={minBudget}
              onChange={(e) =>
                setMinBudget(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500"
            />

            {/* MAX */}

            <input
              type="number"
              placeholder="Max budget"
              value={maxBudget}
              onChange={(e) =>
                setMaxBudget(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-500"
            />

            {/* SEARCH BUTTON */}

            <button
              onClick={handleSearch}
              type="button"
              className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>

          </div>

          <div className="mt-3 flex flex-wrap gap-3">

            <button
              onClick={
                handleFilter
              }
              type="button"
              className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Filter Budget
            </button>

            <button
              onClick={
                resetFilters
              }
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>

          </div>

        </section>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =====================================
            LOADING
        ====================================== */}

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Loading your trips...
          </div>
        )}

        {/* =====================================
            EMPTY
        ====================================== */}

        {!isLoading &&
          trips.length === 0 && (

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="text-4xl">
                ✈️
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                No trips found
              </h2>

              <p className="mt-2 text-slate-500">
                Create your first trip or
                reset your search filters.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/create-trip"
                  )
                }
                className="mt-6 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
              >
                Create Your First Trip
              </button>

            </div>

          )}

        {/* =====================================
            TRIP CARDS
        ====================================== */}

        {!isLoading &&
          trips.length > 0 && (

            <div className="grid gap-5 md:grid-cols-2">

              {trips.map(
                (trip) => (

                  <article
                    key={trip._id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >

                    {/* CARD HEADER */}

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                          📍{" "}
                          {
                            trip.destination
                          }
                        </p>

                        <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                          {
                            trip.title
                          }
                        </h2>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[trip.status]}`}
                      >
                        {formatStatus(
                          trip.status
                        )}
                      </span>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-slate-50 p-3">

                        <p className="text-xs text-slate-400">
                          Budget
                        </p>

                        <p className="mt-1 font-bold text-slate-800">
                          ₹
                          {trip.budget.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">

                        <p className="text-xs text-slate-400">
                          Start Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {new Date(
                            trip.startDate
                          ).toLocaleDateString()}
                        </p>

                      </div>

                    </div>

                    <p className="mt-4 text-sm text-slate-500">

                      {new Date(
                        trip.startDate
                      ).toLocaleDateString()}

                      {" → "}

                      {new Date(
                        trip.endDate
                      ).toLocaleDateString()}

                    </p>

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/my-trips/${trip._id}`
                          )
                        }
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/create-trip?edit=${trip._id}`
                          )
                        }
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            trip._id
                          )
                        }
                        disabled={
                          deletingId ===
                          trip._id
                        }
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId ===
                        trip._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

      </div>

    </main>
  );
}