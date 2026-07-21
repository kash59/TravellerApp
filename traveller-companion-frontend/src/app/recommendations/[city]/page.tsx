
"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";

import {
  MapPin,
  Hotel,
  Utensils,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Plus,
  User,
  Trash2,
  Pencil,
} from "lucide-react";

// ==========================================
// PLACE LOCATION TYPE
// ==========================================

type PlaceLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

// ==========================================
// DESTINATION MAP PROPS
// ==========================================

type DestinationMapProps = {
  city: string;
  latitude: number;
  longitude: number;
  placeLocations?: PlaceLocation[];
};

// ==========================================
// DYNAMIC MAP IMPORT
// Leaflet must only run in the browser
// ==========================================

const DestinationMap = dynamic<DestinationMapProps>(
  () => import("@/components/DestinationMap"),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-[450px] items-center justify-center rounded-3xl bg-slate-100">
        <p className="text-slate-500">
          Loading map...
        </p>
      </div>
    ),
  }
);

// ==========================================
// CITY TYPE
// ==========================================

interface City {
  _id: string;

  name: string;

  description: string;

  location?: {
    latitude: number;
    longitude: number;
  };

  hotels: string[];

  places: string[];

  foods: string[];

  // Attraction coordinates used by DestinationMap
  placeLocations?: PlaceLocation[];
}

// ==========================================
// TRAVEL TIP TYPE
// ==========================================

interface TravelTip {
  _id: string;

  destination: string;

  title: string;

  description: string;

  category: string;

  author?: {
    _id?: string;
    name?: string;
    badge?: string;
  };

  upvotes?: number;

  downvotes?: number;

  createdAt?: string;
}

// ==========================================
// CURRENT USER TYPE
// ==========================================

interface CurrentUser {
  _id: string;
  name: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";
export default function RecommendationPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = use(params);

  const decodedCity = decodeURIComponent(city);

  // ==========================================
  // STATE
  // ==========================================

  const [cityData, setCityData] =
    useState<City | null>(null);

  const [tips, setTips] =
    useState<TravelTip[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [tipsLoading, setTipsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [tipError, setTipError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [votingId, setVotingId] =
    useState<string | null>(null);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Hidden Gem");

const [currentUser, setCurrentUser] =
  useState<CurrentUser | null>(null);

const [deletingId, setDeletingId] =
  useState<string | null>(null);
const [sortBy, setSortBy] =
  useState<"helpful" | "newest">("helpful");
const [editingId, setEditingId] =
  useState<string | null>(null);

const [editTitle, setEditTitle] =
  useState("");

const [editDescription, setEditDescription] =
  useState("");

const [editCategory, setEditCategory] =
  useState("Hidden Gem");

const [updatingId, setUpdatingId] =
  useState<string | null>(null);
const sortedTips = [...tips].sort((a, b) => {
  if (sortBy === "newest") {
    return (
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
    );
  }

  // Most Helpful:
  // First prioritize more upvotes
  const upvoteDifference =
    (b.upvotes ?? 0) - (a.upvotes ?? 0);

  if (upvoteDifference !== 0) {
    return upvoteDifference;
  }

  // If upvotes are equal, fewer downvotes comes first
  const downvoteDifference =
    (a.downvotes ?? 0) - (b.downvotes ?? 0);

  if (downvoteDifference !== 0) {
    return downvoteDifference;
  }

  // Final tie-breaker: newest first
  return (
    new Date(b.createdAt ?? 0).getTime() -
    new Date(a.createdAt ?? 0).getTime()
  );
});

  // ==========================================
  // LOAD DATA
  // ==========================================
// ==========================================
// FETCH CITY
// ==========================================

const fetchCity = async () => {
  try {
    setLoading(true);
    setError("");
    setCityData(null);

    const token = localStorage.getItem("token");

    // ==========================================
    // 1. TRY CURATED CITY FROM MONGODB
    // ==========================================

    if (token) {
      try {
        const response = await fetch(
          `${API_URL}/cities/recommendations?destination=${encodeURIComponent(
            decodedCity
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();

          console.log("Curated city found:", data);

          setCityData(data);

          return;
        }

        console.log(
          `${decodedCity} is not in MongoDB. Using dynamic search...`
        );
      } catch (mongoError) {
        console.log(
          "MongoDB city lookup failed. Trying dynamic search...",
          mongoError
        );
      }
    }

    // ==========================================
    // 2. DYNAMIC DESTINATION SEARCH
    // ==========================================

    const dynamicResponse = await fetch(
      `${API_URL}/destinations/search?city=${encodeURIComponent(
        decodedCity
      )}`,
      {
        cache: "no-store",
      }
    );

    const dynamicData = await dynamicResponse.json();

    if (!dynamicResponse.ok) {
      throw new Error(
        dynamicData?.message ||
          "Destination not found."
      );
    }

    if (
      dynamicData?.location?.latitude === undefined ||
      dynamicData?.location?.longitude === undefined
    ) {
      throw new Error(
        "Destination coordinates were not found."
      );
    }
// ==========================================
// FETCH DYNAMIC TOURIST PLACES
// ==========================================

let dynamicPlaces: PlaceLocation[] = [];

try {
  const placesResponse = await fetch(
    `${API_URL}/destinations/places?lat=${dynamicData.location.latitude}&lng=${dynamicData.location.longitude}`,
    {
      cache: "no-store",
    }
  );

  if (placesResponse.ok) {
    const placesData =
      await placesResponse.json();

    dynamicPlaces =
      Array.isArray(placesData.places)
        ? placesData.places
        : [];
  }
} catch (placesError) {
  console.error(
    "Unable to load dynamic places:",
    placesError
  );

  // Don't fail the whole destination page
  dynamicPlaces = [];
}
    // ==========================================
    // 3. CREATE DYNAMIC CITY
    // ==========================================

    const dynamicCity: City = {
      _id: `dynamic-${decodedCity
        .toLowerCase()
        .replace(/\s+/g, "-")}`,

      name:
        dynamicData.name ||
        decodedCity,

      description:
        dynamicData.displayName ||
        `Explore ${decodedCity}`,

      hotels: [],
      places: dynamicPlaces.map(
  (place) => place.name
),
foods: [],
location: {
  latitude: Number(
    dynamicData.location.latitude
  ),

  longitude: Number(
    dynamicData.location.longitude
  ),
},

placeLocations: dynamicPlaces,
   
    };

    console.log(
      "Dynamic destination created:",
      dynamicCity
    );

    setCityData(dynamicCity);
  } catch (err) {
    console.error(
      "Unable to load destination:",
      err
    );

    setCityData(null);

    setError(
      err instanceof Error
        ? err.message
        : "Unable to load destination."
    );
  } finally {
    setLoading(false);
  }
};

// ==========================================
// FETCH COMMUNITY TIPS
// ==========================================

const fetchTips = async () => {
  try {
    setTipsLoading(true);
    setTipError("");

    const response = await fetch(
      `${API_URL}/travel-tips/${encodeURIComponent(
        decodedCity
      )}`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load community tips."
      );
    }

    setTips(
      Array.isArray(data)
        ? data
        : []
    );
  } catch (err) {
    console.error(
      "Unable to load community tips:",
      err
    );

    setTips([]);

    setTipError(
      err instanceof Error
        ? err.message
        : "Unable to load community tips."
    );
  } finally {
    setTipsLoading(false);
  }
};

// ==========================================
// FETCH CURRENT LOGGED-IN USER
// ==========================================

const fetchCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setCurrentUser(null);
      return;
    }

    const response = await fetch(
      `${API_URL}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.log(
        "Unable to fetch current user."
      );

      setCurrentUser(null);

      return;
    }

    const data = await response.json();

    // Supports either:
    // { _id, name }
    // OR
    // { user: { _id, name } }

    const userData =
      data?.user ?? data;

    if (!userData?._id) {
      setCurrentUser(null);
      return;
    }

    setCurrentUser({
      _id: userData._id,

      name:
        userData.name ||
        "Traveller",
    });
  } catch (err) {
    console.error(
      "Unable to load current user:",
      err
    );

    setCurrentUser(null);
  }
};

// ==========================================
// LOAD DATA
// ==========================================

useEffect(() => {
  fetchCity();
  fetchTips();
  fetchCurrentUser();
}, [decodedCity]);
 
  // ==========================================
  // CREATE COMMUNITY TIP
  // ==========================================

  const handleCreateTip = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setTipError("");
    setSuccess("");

    if (
      !title.trim() ||
      !description.trim()
    ) {
      setTipError(
        "Please enter a title and description."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setTipError(
        "Please login before sharing a travel tip."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/travel-tips`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            destination: decodedCity,

            title: title.trim(),

            description:
              description.trim(),

            category,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to publish your tip."
        );
      }

      setTitle("");

      setDescription("");

      setCategory("Hidden Gem");

      setSuccess(
        "Your travel tip has been shared!"
      );

      setShowForm(false);

      await fetchTips();
    } catch (err) {
      setTipError(
        err instanceof Error
          ? err.message
          : "Unable to publish your tip."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // UPVOTE / DOWNVOTE
  // ==========================================

  const handleVote = async (
    tipId: string,
    voteType: "upvote" | "downvote"
  ) => {
    const token =
      localStorage.getItem("token");

    setTipError("");
    setSuccess("");

    if (!token) {
      setTipError(
        "Please login before voting."
      );

      return;
    }

    try {
      setVotingId(tipId);

      const response = await fetch(
        `${API_URL}/travel-tips/${tipId}/${voteType}`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to submit vote."
        );
      }

      // Update counts immediately

      setTips((currentTips) =>
        currentTips.map((tip) =>
          tip._id === tipId
            ? {
                ...tip,

                upvotes:
                  data.upvotes,

                downvotes:
                  data.downvotes,
              }
            : tip
        )
      );
    } catch (err) {
      setTipError(
        err instanceof Error
          ? err.message
          : "Unable to submit vote."
      );
    } finally {
      setVotingId(null);
    }
    };

  // ==========================================
  // DELETE OWN TRAVEL TIP
  // ==========================================

  const handleDeleteTip = async (tipId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this travel tip?"
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setTipError("Please login first.");
      return;
    }

    try {
      setDeletingId(tipId);
      setTipError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/travel-tips/${tipId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to delete travel tip."
        );
      }

      setTips((currentTips) =>
        currentTips.filter((tip) => tip._id !== tipId)
      );

      setSuccess("Travel tip deleted successfully.");
    } catch (err) {
      setTipError(
        err instanceof Error
          ? err.message
          : "Unable to delete travel tip."
      );
    } finally {
      setDeletingId(null);
    }
  };

//////////////////////////////////////////////////////////////
const handleStartEdit = (tip: TravelTip) => {
  setEditingId(tip._id);

  setEditTitle(tip.title);

  setEditDescription(tip.description);

  setEditCategory(tip.category);

  setTipError("");
  setSuccess("");
};

const handleUpdateTip = async (tipId: string) => {
  if (!editTitle.trim() || !editDescription.trim()) {
    setTipError(
      "Title and description are required."
    );
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    setTipError("Please login first.");
    return;
  }

  try {
    setUpdatingId(tipId);
    setTipError("");
    setSuccess("");

    const response = await fetch(
      `${API_URL}/travel-tips/${tipId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          category: editCategory,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to update travel tip."
      );
    }

    // Update card immediately
    setTips((currentTips) =>
      currentTips.map((tip) =>
        tip._id === tipId
          ? {
              ...tip,
              ...data.tip,
            }
          : tip
      )
    );

    setEditingId(null);

    setSuccess(
      "Travel tip updated successfully."
    );
  } catch (err) {
    setTipError(
      err instanceof Error
        ? err.message
        : "Unable to update travel tip."
    );
  } finally {
    setUpdatingId(null);
  }
};

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <div className="mx-auto max-w-6xl">

          <p className="text-lg text-slate-600">
            Loading destination...
          </p>

        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !cityData) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">

        <div className="mx-auto max-w-6xl rounded-2xl bg-red-50 p-6 text-red-600">

          {error ||
            "Destination not found."}

        </div>

      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">

      <div className="mx-auto max-w-6xl">

        {/* ==================================
            CITY HEADER
        ================================== */}

        <section className="mb-10 rounded-[32px] bg-gradient-to-r from-cyan-600 to-blue-700 p-8 text-white shadow-xl md:p-12">

          <div className="flex items-center gap-3 text-cyan-100">

            <MapPin size={20} />

            <span className="font-semibold uppercase tracking-widest">
              Explore Destination
            </span>

          </div>

          <h1 className="mt-4 text-5xl font-extrabold">
            {cityData.name}
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-cyan-50">
            {cityData.description}
          </p>

        </section>

        {/* ==================================
            CITY RECOMMENDATIONS
        ================================== */}

        <section className="grid gap-6 md:grid-cols-3">

          {/* HOTELS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-xl bg-blue-100 p-3">
                <Hotel className="text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Hotels
              </h2>

            </div>

            <div className="space-y-3">

              {cityData.hotels?.length >
              0 ? (
                cityData.hotels.map(
                  (hotel) => (
                    <div
                      key={hotel}
                      className="rounded-xl bg-slate-50 p-3 text-slate-700"
                    >
                      {hotel}
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-500">
                  No hotels available.
                </p>
              )}

            </div>

          </div>

          {/* PLACES */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-xl bg-cyan-100 p-3">
                <MapPin className="text-cyan-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Places
              </h2>

            </div>

            <div className="space-y-3">

              {cityData.places?.length >
              0 ? (
                cityData.places.map(
                  (place) => (
                    <div
                      key={place}
                      className="rounded-xl bg-slate-50 p-3 text-slate-700"
                    >
                      {place}
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-500">
                  No places available.
                </p>
              )}

            </div>

          </div>

          {/* FOODS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="rounded-xl bg-orange-100 p-3">
                <Utensils className="text-orange-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Foods
              </h2>

            </div>

            <div className="space-y-3">

              {cityData.foods?.length >
              0 ? (
                cityData.foods.map(
                  (food) => (
                    <div
                      key={food}
                      className="rounded-xl bg-slate-50 p-3 text-slate-700"
                    >
                      {food}
                    </div>
                  )
                )
              ) : (
                <p className="text-slate-500">
                  No foods available.
                </p>
              )}

            </div>

          </div>
          

        </section>
           {/* ====================================== */}
      {/* DESTINATION MAP */}
      {/* ====================================== */}

      {cityData.location?.latitude !== undefined &&
        cityData.location?.longitude !== undefined && (
          <section className="mt-12">
            <div className="mb-6">
              <p className="font-semibold uppercase tracking-widest text-cyan-600">
                Explore the Area
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Discover {cityData.name} on the Map
              </h2>

              <p className="mt-2 text-slate-500">
                Explore the destination interactively and get familiar with the
                area before your trip.
              </p>
            </div>

            <DestinationMap
              city={cityData.name}
              latitude={cityData.location.latitude}
              longitude={cityData.location.longitude}
              placeLocations={cityData.placeLocations ?? []}
            />
          </section>
        )}

        {/* ==================================
            COMMUNITY SECTION
        ================================== */}

      <section className="mt-16">

  {/* HEADING + SHARE BUTTON */}

  <div className="mb-8 flex flex-wrap items-end justify-between gap-5">

    <div>

      <div className="flex items-center gap-2 font-semibold uppercase tracking-widest text-cyan-600">
        <Sparkles size={18} />
        Community Insights
      </div>

      <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
        Hidden Gems & Local Tips
      </h2>

      <p className="mt-3 max-w-2xl text-slate-600">
        Discover recommendations shared by travelers who have explored{" "}
        {cityData.name}.
      </p>

    </div>

    <button
      type="button"
      onClick={() => {
        setShowForm((current) => !current);
        setTipError("");
        setSuccess("");
      }}
      className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
    >
      <Plus size={19} />

      {showForm ? "Close Form" : "Share a Tip"}
    </button>

  </div>


  {/* ==================================
      SORTING
  ================================== */}

  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

    <p className="text-sm font-medium text-slate-500">
      {tips.length} community{" "}
      {tips.length === 1 ? "tip" : "tips"}
    </p>

    <div className="flex rounded-xl bg-slate-100 p-1">

      {/* MOST HELPFUL */}

      <button
        type="button"
        onClick={() => setSortBy("helpful")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          sortBy === "helpful"
            ? "bg-white text-cyan-700 shadow-sm"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        👍 Most Helpful
      </button>

      {/* NEWEST */}

      <button
        type="button"
        onClick={() => setSortBy("newest")}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
          sortBy === "newest"
            ? "bg-white text-cyan-700 shadow-sm"
            : "text-slate-500 hover:text-slate-900"
        }`}
      >
        ✨ Newest
      </button>

    </div>

  </div>


          {/* ==================================
              CREATE TIP FORM
          ================================== */}

          {showForm && (
            <form
              onSubmit={
                handleCreateTip
              }
              className="mb-8 rounded-3xl border border-cyan-100 bg-white p-6 shadow-lg md:p-8"
            >

              <h3 className="text-2xl font-bold text-slate-900">
                Share your experience
              </h3>

              <p className="mt-2 text-slate-500">
                Recommend a hidden gem,
                local food, hotel, safety
                advice or useful travel
                information.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* TITLE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tip Title
                  </label>

                  <input
                    value={title}
                    onChange={(
                      event
                    ) =>
                      setTitle(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: Visit Butterfly Beach at sunset"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-cyan-500"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(
                      event
                    ) =>
                      setCategory(
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500"
                  >

                    <option value="Hidden Gem">
                      Hidden Gem
                    </option>

                    <option value="Food">
                      Food
                    </option>

                    <option value="Hotel">
                      Hotel
                    </option>

                    <option value="Safety">
                      Safety
                    </option>

                    <option value="Transport">
                      Transport
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  rows={5}
                  placeholder="Tell other travelers what makes this place special..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-cyan-500"
                />

              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >

                {submitting
                  ? "Publishing..."
                  : "Publish Travel Tip"}

              </button>

            </form>
          )}

          {/* ==================================
              ERROR / SUCCESS
          ================================== */}

          {tipError && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
              {tipError}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          {/* ==================================
              COMMUNITY TIPS
          ================================== */}

          {tipsLoading ? (

            <div className="rounded-2xl bg-white p-8 text-slate-500">
              Loading community tips...
            </div>

          ) : tips.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <Sparkles
                className="mx-auto text-cyan-500"
                size={40}
              />

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                No community tips yet
              </h3>

              <p className="mt-2 text-slate-500">
                Be the first traveler to
                share a hidden gem in{" "}
                {cityData.name}.
              </p>

            </div>

          ) : (

        <div className="grid gap-6 md:grid-cols-2">

  {sortedTips.map((tip) => (

    <article
      key={tip._id}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >

                  {/* CATEGORY + BADGE */}

                  <div className="flex items-start justify-between gap-4">

                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                      {tip.category}
                    </span>

                    {tip.author?.badge && (

                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {
                          tip.author
                            .badge
                        }
                      </span>

                    )}

                  </div>

                {/* ==================================
    EDIT MODE / NORMAL MODE
================================== */}

{editingId === tip._id ? (

  /* EDIT FORM */

  <div className="mt-5 space-y-4">

    {/* EDIT TITLE */}

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Title
      </label>

      <input
        type="text"
        value={editTitle}
        onChange={(event) =>
          setEditTitle(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
      />
    </div>

    {/* EDIT CATEGORY */}

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Category
      </label>

      <select
        value={editCategory}
        onChange={(event) =>
          setEditCategory(event.target.value)
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
      >
        <option value="Hidden Gem">
          Hidden Gem
        </option>

        <option value="Food">
          Food
        </option>

        <option value="Hotel">
          Hotel
        </option>

        <option value="Safety">
          Safety
        </option>

        <option value="Transport">
          Transport
        </option>

        <option value="Shopping">
          Shopping
        </option>

        <option value="Other">
          Other
        </option>
      </select>
    </div>

    {/* EDIT DESCRIPTION */}

    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Description
      </label>

      <textarea
        value={editDescription}
        onChange={(event) =>
          setEditDescription(event.target.value)
        }
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
      />
    </div>

    {/* SAVE + CANCEL */}

    <div className="flex flex-wrap gap-3">

      <button
        type="button"
        onClick={() =>
          handleUpdateTip(tip._id)
        }
        disabled={updatingId === tip._id}
        className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {updatingId === tip._id
          ? "Saving..."
          : "Save Changes"}
      </button>

      <button
        type="button"
        onClick={() => {
          setEditingId(null);
          setTipError("");
        }}
        disabled={updatingId === tip._id}
        className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
      >
        Cancel
      </button>

    </div>

  </div>

) : (

  /* NORMAL TIP DISPLAY */

  <>
    <h3 className="mt-5 text-xl font-bold text-slate-900">
      {tip.title}
    </h3>

    <p className="mt-3 leading-7 text-slate-600">
      {tip.description}
    </p>
  </>

)}

                  {/* AUTHOR + VOTES */}

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">

                    <div className="flex items-center gap-2 text-sm text-slate-500">

                      <User size={17} />

                      <span>
                        {tip.author
                          ?.name ||
                          "Traveller"}
                      </span>

                    </div>

                  <div className="flex flex-wrap items-center gap-2">

  {/* DELETE - ONLY SHOW FOR TIP OWNER */}

{currentUser &&
  tip.author?._id === currentUser._id && (
    <>
      {/* EDIT */}

      <button
        type="button"
        onClick={() => {
  if (editingId === tip._id) {
    setEditingId(null);
  } else {
    handleStartEdit(tip);
  }
}}
        disabled={updatingId === tip._id}
        className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        <Pencil size={16} />
          {editingId === tip._id
          ? "Close Edit"
           : "Edit"}
      </button>

      {/* DELETE */}

      <button
        type="button"
        onClick={() => handleDeleteTip(tip._id)}
        disabled={deletingId === tip._id}
        className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 size={16} />

        {deletingId === tip._id
          ? "Deleting..."
          : "Delete"}
      </button>
    </>
  )}

  {/* UPVOTE */}

  <button
    type="button"
    onClick={() =>
      handleVote(tip._id, "upvote")
    }
    disabled={votingId === tip._id}
    className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <ThumbsUp size={17} />

    {tip.upvotes ?? 0}
  </button>

  {/* DOWNVOTE */}

  <button
    type="button"
    onClick={() =>
      handleVote(tip._id, "downvote")
    }
    disabled={votingId === tip._id}
    className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <ThumbsDown size={17} />

    {tip.downvotes ?? 0}
  </button>

</div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}