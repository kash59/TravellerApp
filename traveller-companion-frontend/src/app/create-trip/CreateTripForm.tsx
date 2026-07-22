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

  // Store newly created trip ID
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
      if (!editTripId) {
        return;
      }

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
  // HANDLE INPUT CHANGE
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
  // HANDLE FORM SUBMIT
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

    // Validate required fields
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

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      setError(
        "End Date must be the same or after Start Date."
      );
      return;
    }

    // Validate budget
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

      // ======================================
      // EDIT EXISTING TRIP
      // ======================================

      if (editTripId) {
        await updateTrip(
          editTripId,
          payload,
          token
        );

        setSuccessMessage(
          "Trip updated successfully."
        );
      }

      // ======================================
      // CREATE NEW TRIP
      // ======================================

      else {
        const createdTrip = await createTrip(
          payload,
          token
        );

        /*
          Depending on your backend/API function,
          createTrip may return either:

          { _id: "..." }

          OR

          { trip: { _id: "..." } }

          This handles both formats.
        */

        const tripId =
          createdTrip?._id ||
          createdTrip?.trip?._id;

        if (tripId) {
          setCreatedTripId(tripId);
        }

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
    <main className="flex min-h-screen items-center justify-center px-6 py-16 text-black">
      <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">

        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
            Plan your journey
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {isEditMode
              ? "Edit Trip"
              : "Create Trip"}
          </h1>
        </div>

        {/* EDIT LOADING */}

        {isPrefillLoading && (
          <p className="mb-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
            Loading trip data...
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* TRIP TITLE */}

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Trip Title
            </label>

            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={onChange("title")}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-gray-900"
              placeholder="Summer in Istanbul"
            />
          </div>

          {/* DESTINATION */}

          <div className="space-y-2">
            <label
              htmlFor="destination"
              className="text-sm font-medium text-gray-700"
            >
              Destination
            </label>

            <input
              id="destination"
              type="text"
              value={formData.destination}
              onChange={onChange("destination")}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-gray-900"
              placeholder="Istanbul"
            />
          </div>

          {/* DATES */}

          <div className="grid gap-5 md:grid-cols-2">

            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={onChange("startDate")}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={onChange("endDate")}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-gray-900"
              />
            </div>

          </div>

          {/* BUDGET */}

          <div className="space-y-2">
            <label
              htmlFor="budget"
              className="text-sm font-medium text-gray-700"
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 outline-none transition focus:border-gray-900"
              placeholder="1200"
            />
          </div>

          {/* ERROR */}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* SUCCESS + VIEW OPTIONS */}

          {successMessage && (
            <div className="space-y-3">

              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                ✓ {successMessage}
              </p>

              {createdTripId && (
                <div className="grid gap-3 sm:grid-cols-2">

                  {/* VIEW NEWLY CREATED TRIP */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/my-trips/${createdTripId}`
                      )
                    }
                    className="rounded-xl border border-black bg-white px-5 py-3 font-medium text-black transition hover:bg-gray-100"
                  >
                    View Trip
                  </button>

                  {/* VIEW ALL TRIPS */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/my-trips")
                    }
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 transition hover:bg-gray-100"
                  >
                    View All My Trips
                  </button>

                </div>
              )}

              {/* EDIT MODE VIEW BUTTON */}

              {isEditMode && editTripId && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/my-trips/${editTripId}`
                    )
                  }
                  className="w-full rounded-xl border border-black bg-white px-5 py-3 font-medium text-black transition hover:bg-gray-100"
                >
                  View Updated Trip
                </button>
              )}

            </div>
          )}

          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isPrefillLoading
            }
            className="w-full rounded-xl bg-black px-6 py-4 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
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