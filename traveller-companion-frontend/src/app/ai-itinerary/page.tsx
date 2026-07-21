"use client";

import { useEffect, useState } from "react";

import {
  generateItinerary,
  getMyTrips,
  saveItinerary,
  Trip,
} from "@/lib/api";

import {
  Sparkles,
  MapPin,
  Wallet,
  CalendarDays,
  Save,
  Loader2,
  CheckCircle2,
  Plane,
} from "lucide-react";

export default function AIItineraryPage() {
  // ==========================================
  // STATE
  // ==========================================

  const [trips, setTrips] = useState<Trip[]>([]);

  const [selectedTripId, setSelectedTripId] =
    useState("");

  const [destination, setDestination] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [days, setDays] =
    useState("");

  const [loadingTrips, setLoadingTrips] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [itinerary, setItinerary] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // LOAD USER TRIPS
  // ==========================================

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoadingTrips(true);

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "Please login to use the AI Trip Planner."
          );

          return;
        }

        const data =
          await getMyTrips(token);

        setTrips(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your trips."
        );
      } finally {
        setLoadingTrips(false);
      }
    };

    loadTrips();
  }, []);

  // ==========================================
  // SELECT SAVED TRIP
  // ==========================================

  const handleTripSelection = (
    tripId: string
  ) => {
    setSelectedTripId(tripId);

    setItinerary("");
    setSuccess("");
    setError("");

    if (!tripId) {
      return;
    }

    const selectedTrip =
      trips.find(
        (trip) => trip._id === tripId
      );

    if (!selectedTrip) {
      return;
    }

    setDestination(
      selectedTrip.destination
    );

    setBudget(
      String(selectedTrip.budget)
    );

    // Calculate number of days from trip dates

    const start =
      new Date(
        selectedTrip.startDate
      );

    const end =
      new Date(
        selectedTrip.endDate
      );

    const difference =
      end.getTime() -
      start.getTime();

    const calculatedDays =
      Math.max(
        1,
        Math.ceil(
          difference /
            (1000 * 60 * 60 * 24)
        ) + 1
      );

    setDays(
      String(calculatedDays)
    );
  };

  // ==========================================
  // GENERATE ITINERARY
  // ==========================================

  const handleGenerate = async () => {
    setError("");
    setSuccess("");
    setItinerary("");

    if (
      !destination.trim() ||
      !budget ||
      !days
    ) {
      setError(
        "Please fill all fields."
      );

      return;
    }

    const numericBudget =
      Number(budget);

    const numericDays =
      Number(days);

    if (
      numericBudget <= 0 ||
      numericDays <= 0
    ) {
      setError(
        "Budget and days must be greater than zero."
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        await generateItinerary(
          destination.trim(),
          numericBudget,
          numericDays
        );

      if (!data?.itinerary) {
        throw new Error(
          "AI did not return an itinerary."
        );
      }

      setItinerary(
        data.itinerary
      );
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

  // ==========================================
  // SAVE ITINERARY TO SELECTED TRIP
  // ==========================================

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!selectedTripId) {
      setError(
        "Select one of your saved trips before saving the itinerary."
      );

      return;
    }

    if (!itinerary.trim()) {
      setError(
        "Generate an itinerary before saving."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login before saving an itinerary."
      );

      return;
    }

    try {
      setSaving(true);

      await saveItinerary(
        selectedTripId,
        itinerary,
        token
      );

      setSuccess(
        "AI itinerary saved to your trip successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save itinerary."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <section className="overflow-hidden rounded-[32px] bg-gradient-to-r from-cyan-600 to-blue-700 p-8 text-white shadow-xl md:p-12">

          <div className="flex items-center gap-2 font-semibold uppercase tracking-widest text-cyan-100">
            <Sparkles size={20} />

            AI Powered Travel
          </div>

          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            AI Trip Planner
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-cyan-50">
            Create a personalized day-by-day
            itinerary based on your destination,
            budget and trip duration.
          </p>

        </section>

        {/* PLANNER */}

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          {/* SAVED TRIP SELECTION */}

          <div className="mb-8">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Plan for one of your saved trips
            </label>

            <select
              value={selectedTripId}
              onChange={(event) =>
                handleTripSelection(
                  event.target.value
                )
              }
              disabled={loadingTrips}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
            >

              <option value="">
                {loadingTrips
                  ? "Loading your trips..."
                  : "Select a saved trip (optional)"}
              </option>

              {trips.map((trip) => (
                <option
                  key={trip._id}
                  value={trip._id}
                >
                  {trip.title} —{" "}
                  {trip.destination}
                </option>
              ))}

            </select>

            <p className="mt-2 text-sm text-slate-500">
              Selecting a saved trip automatically
              fills its destination, budget and
              duration.
            </p>

          </div>

          {/* INPUTS */}

          <div className="grid gap-5 md:grid-cols-3">

            {/* DESTINATION */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin
                  size={17}
                  className="text-cyan-600"
                />

                Destination
              </label>

              <input
                type="text"
                placeholder="Example: Goa"
                value={destination}
                onChange={(event) =>
                  setDestination(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
              />

            </div>

            {/* BUDGET */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Wallet
                  size={17}
                  className="text-cyan-600"
                />

                Budget (₹)
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 20000"
                value={budget}
                onChange={(event) =>
                  setBudget(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
              />

            </div>

            {/* DAYS */}

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays
                  size={17}
                  className="text-cyan-600"
                />

                Number of Days
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 3"
                value={days}
                onChange={(event) =>
                  setDays(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
              />

            </div>

          </div>

          {/* GENERATE */}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="mt-7 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />

                Generating your trip...
              </>
            ) : (
              <>
                <Sparkles size={19} />

                Generate AI Itinerary
              </>
            )}

          </button>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-700">

              <CheckCircle2 size={20} />

              {success}

            </div>
          )}

        </section>

        {/* GENERATED ITINERARY */}

        {itinerary && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            <div className="flex flex-wrap items-center justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 font-semibold uppercase tracking-widest text-cyan-600">

                  <Plane size={18} />

                  Your Journey

                </div>

                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                  Your AI Itinerary
                </h2>

                <p className="mt-2 text-slate-500">
                  {destination} • {days}{" "}
                  {Number(days) === 1
                    ? "Day"
                    : "Days"}{" "}
                  • ₹{Number(
                    budget
                  ).toLocaleString("en-IN")}
                </p>

              </div>

              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  !selectedTripId
                }
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >

                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />

                    Save to Trip
                  </>
                )}

              </button>

            </div>

            {!selectedTripId && (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                This itinerary was generated
                successfully. To save it permanently,
                select one of your saved trips above.
              </p>
            )}

            {/* AI RESPONSE */}

            <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-slate-50 p-6 leading-8 text-slate-700">
              {itinerary}
            </div>

          </section>
        )}

      </div>

    </main>
  );
}