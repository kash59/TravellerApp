"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createTrip, getTripById, updateTrip } from "@/lib/api";

type FormState = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
};

const initialFormState: FormState = {
  title: "",
  destination: "",
  startDate: "",
  endDate: "",
  budget: "",
};

export default function CreateTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editTripId = searchParams.get("edit");
  const isEditMode = useMemo(() => Boolean(editTripId), [editTripId]);

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrefillLoading, setIsPrefillLoading] = useState(false);

  useEffect(() => {
    const loadTripForEdit = async () => {
      if (!editTripId) return;

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        router.push("/login");
        return;
      }

      try {
        setIsPrefillLoading(true);
        setError("");

        const trip = await getTripById(editTripId, token);

        setFormData({
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate.slice(0, 10),
          endDate: trip.endDate.slice(0, 10),
          budget: String(trip.budget),
        });
      } catch (prefillError) {
        const message =
          prefillError instanceof Error
            ? prefillError.message
            : "Unable to load trip for editing.";

        setError(message);
      } finally {
        setIsPrefillLoading(false);
      }
    };

    loadTripForEdit();
  }, [editTripId, router]);

  const onChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setCreatedTripId(null);

    const {
      title,
      destination,
      startDate,
      endDate,
      budget,
    } = formData;

    if (
      !title.trim() ||
      !destination.trim() ||
      !startDate ||
      !endDate ||
      !budget.trim()
    ) {
      setError("All fields are required.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End Date must be the same or after Start Date.");
      return;
    }

    const budgetValue = Number(budget);

    if (Number.isNaN(budgetValue)) {
      setError("Budget must be a number.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login first.");
      router.push("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        budget: budgetValue,
      };

      if (editTripId) {
        await updateTrip(editTripId, payload, token);
        setSuccessMessage("Trip updated successfully.");
      } else {
        const createdTrip = await createTrip(payload, token);

        const tripId =
          createdTrip?._id ||
          createdTrip?.trip?._id;

        if (tripId) {
          setCreatedTripId(tripId);
        }

        setSuccessMessage("Trip created successfully.");
        setFormData(initialFormState);
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : `Unable to ${
              isEditMode ? "update" : "create"
            } trip right now.`;

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-6 py-12 text-black">

      <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-120px)] max-w-7xl items-center gap-12 lg:grid-cols-2">

        <div className="hidden lg:block">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm">
            ✈ Your journey starts here
          </div>

          <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
            Your next adventure
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              starts with a plan.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
            Create your trip, organize the important details and turn
            your travel ideas into an unforgettable journey.
          </p>

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                📍
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Plan your destination
                </p>
                <p className="text-sm text-slate-500">
                  Keep your travel details organized.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-xl">
                ✨
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Discover recommendations
                </p>
                <p className="text-sm text-slate-500">
                  Explore places for your journey.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-xl">
                🗺️
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Build your itinerary
                </p>
                <p className="text-sm text-slate-500">
                  Turn your plan into a complete trip.
                </p>
              </div>
            </div>

          </div>

          <div className="mt-10 max-w-lg rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-xl">

            <p className="text-sm font-semibold text-white/80">
              TRAVELLER COMPANION
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Explore more. Plan smarter.
            </h2>

            <div className="mt-5 flex items-center gap-3 text-sm">
              <span className="rounded-full bg-white/15 px-4 py-2">
                Plan
              </span>
              <span>→</span>
              <span className="rounded-full bg-white/15 px-4 py-2">
                Explore
              </span>
              <span>→</span>
              <span className="rounded-full bg-white/15 px-4 py-2">
                Travel
              </span>
            </div>

          </div>

        </div>

        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-10">

          <div className="mb-8">

            <p className="font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Plan your journey
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
              {isEditMode ? "Edit Trip" : "Create Trip"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {isEditMode
                ? "Update your travel details below."
                : "Enter your trip details and start planning your adventure."}
            </p>

          </div>

          {isPrefillLoading && (
            <p className="mb-5 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
              Loading trip data...
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-semibold text-slate-700"
              >
                Trip Title
              </label>

              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={onChange("title")}
                placeholder="Summer in Istanbul"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="destination"
                className="text-sm font-semibold text-slate-700"
              >
                Destination
              </label>

              <input
                id="destination"
                type="text"
                value={formData.destination}
                onChange={onChange("destination")}
                placeholder="Istanbul"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div className="space-y-2">
                <label
                  htmlFor="startDate"
                  className="text-sm font-semibold text-slate-700"
                >
                  Start Date
                </label>

                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={onChange("startDate")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="endDate"
                  className="text-sm font-semibold text-slate-700"
                >
                  End Date
                </label>

                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={onChange("endDate")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

            </div>

            <div className="space-y-2">
              <label
                htmlFor="budget"
                className="text-sm font-semibold text-slate-700"
              >
                Budget
              </label>

              <input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={onChange("budget")}
                placeholder="50000"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {successMessage && (
              <div className="space-y-3">

                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  ✓ {successMessage}
                </p>

                {createdTripId && (
                  <div className="grid gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/my-trips/${createdTripId}`)
                      }
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white"
                    >
                      View Trip
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/my-trips")}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View All My Trips
                    </button>

                  </div>
                )}

                {isEditMode && editTripId && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/my-trips/${editTripId}`)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Updated Trip
                  </button>
                )}

              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isPrefillLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating Trip..."
                  : "Creating Trip..."
                : isEditMode
                  ? "Update Trip"
                  : "Create Trip"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}