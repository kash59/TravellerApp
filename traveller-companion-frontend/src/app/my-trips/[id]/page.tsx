"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import {
  deleteTrip,
  getPlaceSuggestionsByCity,
  getTripById,
  generateItinerary,
  saveItinerary,
  PlaceSuggestion,
  TripDetails,
} from "@/lib/api";

export default function TripDetailsPage() {
  // ==========================================
  // ROUTER
  // ==========================================

  const params = useParams<{ id: string }>();
  const router = useRouter();

  // ==========================================
  // STATE
  // ==========================================

  const [trip, setTrip] =
    useState<TripDetails | null>(null);

  const [recommendations, setRecommendations] =
    useState<PlaceSuggestion[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [aiItinerary, setAiItinerary] =
    useState("");

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [itinerarySaved, setItinerarySaved] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================
  // FETCH TRIP DETAILS
  // ==========================================

  useEffect(() => {
    const fetchDetails = async () => {
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login first to view trip details."
        );

        setIsLoading(false);

        router.push("/login");

        return;
      }

      try {
        // --------------------------------------
        // GET TRIP
        // --------------------------------------

        const tripDetails =
          await getTripById(
            params.id,
            token
          );

        setTrip(tripDetails);

        // --------------------------------------
        // LOAD SAVED ITINERARY
        // --------------------------------------

        if (tripDetails.itinerary) {
          setAiItinerary(
            tripDetails.itinerary
          );

          setItinerarySaved(true);
        } else {
          setAiItinerary("");
          setItinerarySaved(false);
        }

        // --------------------------------------
        // GET RECOMMENDATIONS
        // --------------------------------------

        try {
          const cityRecommendations =
            await getPlaceSuggestionsByCity(
              tripDetails.destination
            );

          setRecommendations(
            Array.isArray(
              cityRecommendations
            )
              ? cityRecommendations
              : []
          );
        } catch (
          recommendationError
        ) {
          console.error(
            "Unable to load recommendations:",
            recommendationError
          );

          // Do not fail the whole trip page
          setRecommendations([]);
        }
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load trip details right now.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [params.id, router]);

  // ==========================================
  // DELETE TRIP
  // ==========================================

  const handleDelete = async () => {
    const token =
      localStorage.getItem("token");

    const currentTrip = trip;

    if (!token) {
      setError(
        "Please login first."
      );

      router.push("/login");

      return;
    }

    if (!currentTrip) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${currentTrip.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteTrip(
        currentTrip._id,
        token
      );

      router.push("/my-trips");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete trip right now.";

      setError(message);

      setIsDeleting(false);
    }
  };

  // ==========================================
  // GENERATE / REGENERATE AI ITINERARY
  // ==========================================

  const handleGenerateItinerary =
    async () => {
      if (!trip) {
        return;
      }

      try {
        setIsGenerating(true);

        setError("");

        setSuccessMessage("");

        // --------------------------------------
        // CALCULATE NUMBER OF DAYS
        // --------------------------------------

        const tripDays = Math.max(
          1,

          Math.ceil(
            (new Date(
              trip.endDate
            ).getTime() -
              new Date(
                trip.startDate
              ).getTime()) /
              (1000 *
                60 *
                60 *
                24)
          ) + 1
        );

        // --------------------------------------
        // GENERATE WITH GEMINI
        // --------------------------------------

        const result =
          await generateItinerary(
            trip.destination,
            trip.budget,
            tripDays
          );

        if (!result?.itinerary) {
          throw new Error(
            "AI did not return an itinerary."
          );
        }

        setAiItinerary(
          result.itinerary
        );

        // New AI result has not been saved yet
        setItinerarySaved(false);

        setSuccessMessage("");
      } catch (err) {
        console.error(
          "Generate itinerary error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate itinerary."
        );
      } finally {
        setIsGenerating(false);
      }
    };

  // ==========================================
  // SAVE AI ITINERARY
  // ==========================================

  const handleSaveItinerary =
    async () => {
      if (
        !trip ||
        !aiItinerary.trim()
      ) {
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login first."
        );

        router.push("/login");

        return;
      }

      try {
        setIsSaving(true);

        setError("");

        setSuccessMessage("");

        await saveItinerary(
          trip._id,
          aiItinerary,
          token
        );

        setItinerarySaved(true);

        setSuccessMessage(
          "Itinerary saved successfully!"
        );

        // Update local trip state as well
        setTrip((previousTrip) => {
          if (!previousTrip) {
            return previousTrip;
          }

          return {
            ...previousTrip,
            itinerary:
              aiItinerary,
          };
        });
      } catch (err) {
        console.error(
          "Save itinerary error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to save itinerary."
        );
      } finally {
        setIsSaving(false);
      }
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Loading trip details...
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !trip) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl rounded-xl bg-red-50 px-5 py-4 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  // ==========================================
  // TRIP NOT FOUND
  // ==========================================

  if (!trip) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          Trip not found.
        </div>
      </main>
    );
  }

  // ==========================================
  // CALCULATE TRIP DAYS
  // ==========================================

  const tripDays = Math.max(
    1,

    Math.ceil(
      (new Date(
        trip.endDate
      ).getTime() -
        new Date(
          trip.startDate
        ).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">

      <div className="mx-auto max-w-5xl space-y-8">

        {/* =====================================
            PAGE HEADER
        ====================================== */}

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              Trip Details
            </p>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
              {trip.title}
            </h1>

            <p className="mt-2 text-slate-500">
              Your personalized journey to{" "}
              {trip.destination}
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            {/* BACK */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/my-trips"
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              ← Back to My Trips
            </button>

            {/* GENERATE / REGENERATE */}

            <button
              type="button"
              onClick={
                handleGenerateItinerary
              }
              disabled={isGenerating}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating
                ? "✨ Generating..."
                : aiItinerary
                ? "✨ Regenerate AI Itinerary"
                : "✨ Generate AI Itinerary"}
            </button>

            {/* DELETE */}

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>

        </div>

        {/* =====================================
            ERROR MESSAGE
        ====================================== */}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =====================================
            OVERVIEW
        ====================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <h2 className="text-xl font-bold text-slate-900">
              Overview
            </h2>

            <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold capitalize text-cyan-700">
              {trip.status}
            </span>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {/* DESTINATION */}

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Destination
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                📍 {trip.destination}
              </p>

            </div>

            {/* BUDGET */}

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Budget
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                💰 ₹
                {trip.budget.toLocaleString(
                  "en-IN"
                )}
              </p>

            </div>

            {/* DURATION */}

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Duration
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                📅 {tripDays}{" "}
                {tripDays === 1
                  ? "Day"
                  : "Days"}
              </p>

            </div>

            {/* DATES */}

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Travel Dates
              </p>

              <p className="mt-2 font-semibold text-slate-900">
                {new Date(
                  trip.startDate
                ).toLocaleDateString()}

                {" → "}

                {new Date(
                  trip.endDate
                ).toLocaleDateString()}
              </p>

            </div>

          </div>

        </section>

        {/* =====================================
            SAVED SUGGESTIONS
        ====================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Saved Suggestions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Places you have saved for this
            journey.
          </p>

          {trip.savedSuggestions.length ===
          0 ? (

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

              <p className="text-2xl">
                📌
              </p>

              <p className="mt-3 font-semibold text-slate-700">
                No saved suggestions yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Explore destination
                recommendations and save places
                you would like to visit.
              </p>

            </div>

          ) : (

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {trip.savedSuggestions.map(
                (suggestion) => (

                  <article
                    key={
                      suggestion._id
                    }
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-200 hover:shadow-sm"
                  >

                    <h3 className="font-bold text-slate-900">
                      {
                        suggestion.placeName
                      }
                    </h3>

                    {suggestion.category && (

                      <span className="mt-2 inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                        {
                          suggestion.category
                        }
                      </span>

                    )}

                    {suggestion.description && (

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {
                          suggestion.description
                        }
                      </p>

                    )}

                  </article>

                )
              )}

            </div>

          )}

        </section>

        {/* =====================================
            AI ITINERARY
        ====================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* AI HEADER */}

          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-purple-50 to-cyan-50 px-6 py-7 md:px-8">

            <div className="flex flex-wrap items-center justify-between gap-5">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.18em] text-purple-600">
                  ✨ AI Powered Journey
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                  Your{" "}
                  {trip.destination}{" "}
                  Itinerary
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  A personalized travel plan
                  created around your destination,
                  budget and trip duration.
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  📅 {tripDays}{" "}
                  {tripDays === 1
                    ? "Day"
                    : "Days"}
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  💰 ₹
                  {trip.budget.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* AI CONTENT */}

          {aiItinerary ? (

            <div className="p-6 md:p-8">

              {/* MARKDOWN CONTENT */}

              <div
                className="
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50/70
                  p-6
                  md:p-8

                  [&_h1]:mb-5
                  [&_h1]:mt-2
                  [&_h1]:text-3xl
                  [&_h1]:font-extrabold
                  [&_h1]:text-slate-900

                  [&_h2]:mb-4
                  [&_h2]:mt-10
                  [&_h2]:border-b
                  [&_h2]:border-slate-200
                  [&_h2]:pb-3
                  [&_h2]:text-2xl
                  [&_h2]:font-extrabold
                  [&_h2]:text-slate-900

                  [&_h3]:mb-3
                  [&_h3]:mt-7
                  [&_h3]:text-lg
                  [&_h3]:font-bold
                  [&_h3]:text-purple-700

                  [&_h4]:mb-2
                  [&_h4]:mt-6
                  [&_h4]:font-bold
                  [&_h4]:text-slate-800

                  [&_p]:my-3
                  [&_p]:leading-8
                  [&_p]:text-slate-700

                  [&_ul]:my-5
                  [&_ul]:space-y-3
                  [&_ul]:pl-6

                  [&_ol]:my-5
                  [&_ol]:space-y-3
                  [&_ol]:pl-6

                  [&_li]:leading-7
                  [&_li]:text-slate-700

                  [&_strong]:font-bold
                  [&_strong]:text-slate-900

                  [&_hr]:my-8
                  [&_hr]:border-slate-200
                "
              >

                <ReactMarkdown
                  components={{
                    ul: ({
                      children,
                    }) => (
                      <ul className="list-disc">
                        {children}
                      </ul>
                    ),

                    ol: ({
                      children,
                    }) => (
                      <ol className="list-decimal">
                        {children}
                      </ol>
                    ),

                    blockquote: ({
                      children,
                    }) => (
                      <blockquote className="my-6 rounded-r-xl border-l-4 border-purple-500 bg-purple-50 px-5 py-4 leading-7 text-slate-700">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {aiItinerary}
                </ReactMarkdown>

              </div>

              {/* SAVE STATUS + BUTTON */}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-slate-100 pt-6">

                <div>

                  {itinerarySaved ? (

                    <div>

                      <p className="font-semibold text-green-600">
                        ✓ Itinerary saved to
                        this trip
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        You can return to My
                        Trips anytime to view
                        this itinerary.
                      </p>

                    </div>

                  ) : (

                    <div>

                      <p className="font-semibold text-slate-700">
                        Like this itinerary?
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Save it permanently to
                        this trip.
                      </p>

                    </div>

                  )}

                  {successMessage && (

                    <p className="mt-2 text-sm font-semibold text-green-600">
                      {successMessage}
                    </p>

                  )}

                </div>

                {!itinerarySaved && (

                  <button
                    type="button"
                    onClick={
                      handleSaveItinerary
                    }
                    disabled={isSaving}
                    className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isSaving
                      ? "Saving..."
                      : "💾 Save Itinerary"}
                  </button>

                )}

              </div>

            </div>

          ) : (

            /* EMPTY AI STATE */

            <div className="p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-3xl">
                ✨
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Your itinerary is waiting
              </h3>

              <p className="mx-auto mt-2 max-w-md leading-7 text-slate-500">
                Generate a personalized{" "}
                {tripDays}-day travel plan
                for {trip.destination} based
                on your ₹
                {trip.budget.toLocaleString(
                  "en-IN"
                )}{" "}
                budget.
              </p>

              <button
                type="button"
                onClick={
                  handleGenerateItinerary
                }
                disabled={isGenerating}
                className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating
                  ? "✨ Generating..."
                  : "✨ Generate AI Itinerary"}
              </button>

            </div>

          )}

        </section>

        {/* =====================================
            RECOMMENDATIONS
        ====================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <div>

            <p className="text-sm font-bold uppercase tracking-[0.15em] text-cyan-600">
              Discover More
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Recommendations
            </h2>

          </div>

          {recommendations.length ===
          0 ? (

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

              <p className="text-2xl">
                🗺️
              </p>

              <p className="mt-3 font-semibold text-slate-700">
                No recommendations available
              </p>

              <p className="mt-1 text-sm text-slate-500">
                We do not have additional
                recommendations for this
                destination yet.
              </p>

            </div>

          ) : (

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {recommendations.map(
                (recommendation) => (

                  <article
                    key={
                      recommendation._id
                    }
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-cyan-200 hover:shadow-sm"
                  >

                    <h3 className="font-bold text-slate-900">
                      {
                        recommendation.placeName
                      }
                    </h3>

                    {typeof recommendation.ratingAverage ===
                      "number" && (

                      <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-amber-600">

                        <span>
                          ★
                        </span>

                        <span>
                          {recommendation.ratingAverage.toFixed(
                            1
                          )}
                        </span>

                      </div>

                    )}

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}