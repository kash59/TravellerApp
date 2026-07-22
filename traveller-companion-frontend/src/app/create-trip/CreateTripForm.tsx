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

  const isEditMode = useMemo(
    () => Boolean(editTripId),
    [editTripId]
  );

  const [formData, setFormData] =
    useState<FormState>(initialFormState);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdTripId, setCreatedTripId] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrefillLoading, setIsPrefillLoading] =
    useState(false);

  // ==========================================
  // LOAD TRIP WHEN EDITING
  // ==========================================

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

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const onChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  // ==========================================
  // SUBMIT
  // ==========================================

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
      setError(
        "End Date must be the same or after Start Date."
      );
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

      // EDIT TRIP
      if (editTripId) {
        await updateTrip(editTripId, payload, token);

        setSuccessMessage("Trip updated successfully.");
      }

      // CREATE NEW TRIP
      else {
        const createdTrip = await createTrip(
          payload,
          token
        );

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

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5f2] px-5 py-12 text-black md:px-8 md:py-16">

      {/* ====================================== */}
      {/* PINTEREST-STYLE BACKGROUND */}
      {/* ====================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Soft background blobs */}

        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />

        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />

        {/* LEFT TOP CARD */}

        <div className="absolute left-[3%] top-[7%] hidden w-48 -rotate-6 rounded-[28px] bg-white p-3 shadow-xl xl:block">
          <div className="flex h-56 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-200 via-cyan-100 to-blue-200">
            <div className="text-center">
              <span className="text-6xl">🌊</span>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Coastal Escape
              </p>
            </div>
          </div>
        </div>

        {/* LEFT BOTTOM CARD */}

        <div className="absolute bottom-[5%] left-[7%] hidden w-52 rotate-6 rounded-[28px] bg-white p-3 shadow-xl xl:block">
          <div className="flex h-64 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-100 via-rose-100 to-amber-200">
            <div className="text-center">
              <span className="text-6xl">🏜️</span>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Golden Adventures
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT TOP CARD */}

        <div className="absolute right-[5%] top-[8%] hidden w-52 rotate-6 rounded-[28px] bg-white p-3 shadow-xl xl:block">
          <div className="flex h-64 items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-100 via-green-100 to-lime-100">
            <div className="text-center">
              <span className="text-6xl">🌿</span>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Nature Retreat
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT BOTTOM CARD */}

        <div className="absolute bottom-[4%] right-[7%] hidden w-48 -rotate-6 rounded-[28px] bg-white p-3 shadow-xl xl:block">
          <div className="flex h-56 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100">
            <div className="text-center">
              <span className="text-6xl">🏙️</span>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                City Stories
              </p>
            </div>
          </div>
        </div>

        {/* Small decorative elements */}

        <div className="absolute left-[18%] top-[18%] hidden rotate-12 rounded-full bg-white px-5 py-3 text-2xl shadow-md lg:block">
          ✈️
        </div>

        <div className="absolute bottom-[15%] right-[20%] hidden -rotate-12 rounded-full bg-white px-5 py-3 text-2xl shadow-md lg:block">
          📍
        </div>

      </div>

      {/* ====================================== */}
      {/* CREATE / EDIT TRIP CARD */}
      {/* ====================================== */}

      <div className="relative z-10 mx-auto w-full max-w-2xl rounded-[32px] border border-white/80 bg-white/90 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl md:p-10">

        {/* HEADER */}

        <div className="mb-8">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            <span>✈</span>
            Plan your journey
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {isEditMode ? "Edit Trip" : "Create Trip"}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {isEditMode
              ? "Update your travel details and keep your adventure organized."
              : "Turn your travel inspiration into your next unforgettable journey."}
          </p>

        </div>

        {/* EDIT LOADING */}

        {isPrefillLoading && (
          <p className="mb-5 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
            Loading trip data...
          </p>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* TRIP TITLE */}

          <div className="space-y-2">

            <label
              htmlFor="title"
              className="text-sm font-semibold text-gray-700"
            >
              Trip Title
            </label>

            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={onChange("title")}
              placeholder="Summer in Istanbul"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-black shadow-sm outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />

          </div>

          {/* DESTINATION */}

          <div className="space-y-2">

            <label
              htmlFor="destination"
              className="text-sm font-semibold text-gray-700"
            >
              Destination
            </label>

            <input
              id="destination"
              type="text"
              value={formData.destination}
              onChange={onChange("destination")}
              placeholder="Istanbul"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-black shadow-sm outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />

          </div>

          {/* DATES */}

          <div className="grid gap-5 md:grid-cols-2">

            <div className="space-y-2">

              <label
                htmlFor="startDate"
                className="text-sm font-semibold text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={onChange("startDate")}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-black shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

            </div>

            <div className="space-y-2">

              <label
                htmlFor="endDate"
                className="text-sm font-semibold text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={onChange("endDate")}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-black shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />

            </div>

          </div>

          {/* BUDGET */}

          <div className="space-y-2">

            <label
              htmlFor="budget"
              className="text-sm font-semibold text-gray-700"
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
              placeholder="1200"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-black shadow-sm outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />

          </div>

          {/* ERROR */}

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {/* SUCCESS */}

          {successMessage && (

            <div className="space-y-3">

              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                ✓ {successMessage}
              </p>

              {/* VIEW CREATED TRIP */}

              {createdTripId && (

                <div className="grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/my-trips/${createdTripId}`
                      )
                    }
                    className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    View Trip
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/my-trips")
                    }
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                  >
                    View All My Trips
                  </button>

                </div>

              )}

              {/* EDIT MODE VIEW */}

              {isEditMode && editTripId && (

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/my-trips/${editTripId}`
                    )
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                >
                  View Updated Trip
                </button>

              )}

            </div>

          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isPrefillLoading
            }
            className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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

    </main>
  );
}