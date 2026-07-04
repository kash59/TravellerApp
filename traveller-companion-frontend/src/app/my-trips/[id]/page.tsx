"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  deleteTrip,
  getPlaceSuggestionsByCity,
  getTripById,
  getSavedItinerary,
  generateItinerary,
  saveItinerary,
  PlaceSuggestion,
  TripDetails,
} from "@/lib/api";

export default function TripDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [recommendations, setRecommendations] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiItinerary, setAiItinerary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first to view trip details.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const tripDetails = await getTripById(params.id, token);
        setTrip(tripDetails);

        if (tripDetails.itinerary) {
          setAiItinerary(tripDetails.itinerary);
        }

        const cityRecommendations = await getPlaceSuggestionsByCity(tripDetails.destination);
        setRecommendations(cityRecommendations);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load trip details right now.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [params.id, router]);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    const currentTrip = trip;

    if (!token) {
      setError("Please login first.");
      router.push("/login");
      return;
    }

    if (!currentTrip) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteTrip(currentTrip._id, token);
      router.push("/my-trips");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Unable to delete trip right now.";
      setError(message);
      setIsDeleting(false);
    }
  };

  const handleGenerateItinerary = async () => {
    if (!trip) return;

    try {
      setIsGenerating(true);

      const tripDays = Math.max(
        1,
        Math.ceil(
          (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );

      const result = await generateItinerary(
        trip.destination,
        trip.budget,
        tripDays
      );

      setAiItinerary(result.itinerary);
    } catch (err) {
      console.error(err);
      alert("Failed to generate itinerary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!trip || !aiItinerary) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setIsSaving(true);

      await saveItinerary(trip._id, aiItinerary, token);

      alert("Itinerary saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save itinerary.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 text-gray-600">
          Loading trip details...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="min-h-screen px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          Trip not found.
        </div>
      </main>
    );
  }

  const tripDays = Math.max(
    1,
    Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  return (
    <main className="min-h-screen px-6 py-12 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Trip Details
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {trip.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/my-trips")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-500"
            >
              Back to My Trips
            </button>
            <button
              onClick={handleGenerateItinerary}
              disabled={isGenerating}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-300"
            >
              {isGenerating ? "Generating..." : "Generate AI Itinerary"}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
          <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
            <p>Destination: {trip.destination}</p>
            <p>Budget: ₹{trip.budget}</p>
            <p>Status: {trip.status}</p>
            <p>
              Dates: {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Saved Suggestions</h2>
          {trip.savedSuggestions.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No saved suggestions yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {trip.savedSuggestions.map((suggestion) => (
                <article key={suggestion._id} className="rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">{suggestion.placeName}</h3>
                  {suggestion.category ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                      {suggestion.category}
                    </p>
                  ) : null}
                  {suggestion.description ? (
                    <p className="mt-2 text-sm text-gray-600">{suggestion.description}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">AI Itinerary</h2>
            <p className="text-sm text-gray-500">Estimated days: {tripDays}</p>
          </div>

          {aiItinerary ? (
            <div className="mt-4 space-y-4">
              <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                {aiItinerary}
              </pre>
              <button
                onClick={handleSaveItinerary}
                disabled={isSaving}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSaving ? "Saving..." : "Save Itinerary"}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">
              Click Generate AI Itinerary to create a day-wise trip plan for this destination.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
          {recommendations.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">No recommendations available for this destination.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {recommendations.map((recommendation) => (
                <article key={recommendation._id} className="rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">{recommendation.placeName}</h3>
                  {typeof recommendation.ratingAverage === "number" ? (
                    <p className="mt-1 text-sm text-gray-600">
                      Rating: {recommendation.ratingAverage.toFixed(1)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
  
