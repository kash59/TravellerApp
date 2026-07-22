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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrefillLoading, setIsPrefillLoading] = useState(false);

  // ==========================================
  // LOAD TRIP DATA WHEN EDITING
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

        const trip = await getTripById(
          editTripId,
          token
        );

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
      setFormData((previous) => ({
        ...previous,
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

    if (
      new Date(endDate) <
      new Date(startDate)
    ) {
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

    const token =
      localStorage.getItem("token");

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
        await updateTrip(
          editTripId,
          payload,
          token
        );

        setSuccessMessage(
          "Trip updated successfully."
        );
      } else {
        await createTrip(
          payload,
          token
        );

        setSuccessMessage(
          "Trip created successfully."
        );

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
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">

      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      {/* FORM CONTAINER */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] w-full items-center justify-center px-6 py-12">

        <div className="w-full max-w-2xl rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-md md:p-10">

          {/* HEADER */}

          <div className="mb-8 text-center">

            <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              ✈ Plan Your Journey
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {isEditMode
                ? "Edit Trip"
                : "Create Trip"}
            </h1>

          </div>

          {/* LOADING */}

          {isPrefillLoading && (
            <p className="mb-5 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* DESTINATION */}

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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* DATES */}

            <div className="grid gap-5 md:grid-cols-2">

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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* BUDGET */}

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
                placeholder="1200"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* ERROR */}

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </p>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isPrefillLoading
              }
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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