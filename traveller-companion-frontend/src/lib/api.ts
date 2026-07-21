const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";
interface CreateTripPayload {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface Trip {
  _id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "planned" | "ongoing" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSuggestion {
  _id: string;
  city: string;
  placeName: string;
  description?: string;
  category?: string;
  ratingAverage?: number;
}

export interface TripDetails extends Trip {
  savedSuggestions: PlaceSuggestion[];
  itinerary: string;
}

export async function getCityRecommendations(
  city: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/cities/recommendations?destination=${city}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch city");
  }

  return response.json();
}

export async function createTrip(payload: CreateTripPayload, token: string) {
  const response = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const validationMessage = Array.isArray(data?.errors)
      ? data.errors[0]?.msg
      : undefined;
    throw new Error(validationMessage || data?.message || "Failed to create trip");
  }

  return data;
}

export async function updateTrip(
  tripId: string,
  payload: CreateTripPayload,
  token: string
) {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const validationMessage = Array.isArray(data?.errors)
      ? data.errors[0]?.msg
      : undefined;
    throw new Error(validationMessage || data?.message || "Failed to update trip");
  }

  return data;
}

export async function getMyTrips(token: string): Promise<Trip[]> {
  const response = await fetch(`${API_URL}/trips/mytrips`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch trips");
  }

  return data;
}

export async function deleteTrip(tripId: string, token: string) {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete trip");
  }

  return data;
}

export async function getTripById(tripId: string, token: string): Promise<TripDetails> {
  const response = await fetch(`${API_URL}/trips/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch trip details");
  }

  return data;
}

export async function getPlaceSuggestionsByCity(city: string): Promise<PlaceSuggestion[]> {
  const response = await fetch(
    `${API_URL}/suggestions/${encodeURIComponent(city)}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch recommendations");
  }

  return data;
}

export async function searchTrips(city: string, token: string): Promise<Trip[]> {
  const response = await fetch(
    `${API_URL}/trips/search?city=${encodeURIComponent(city)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to search trips");
  }

  return data;
}

export async function filterTrips(
  minBudget: number,
  maxBudget: number,
  token: string
): Promise<Trip[]> {
  const response = await fetch(
    `${API_URL}/trips/filter?minBudget=${minBudget}&maxBudget=${maxBudget}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to filter trips");
  }

  return data;
}
export async function getTripStats(token: string) {
  const response = await fetch(`${API_URL}/trips/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch stats");
  }

  return data;
}

export async function getStatusAnalytics(token: string) {
  const response = await fetch(`${API_URL}/trips/analytics/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch analytics");
  }

  return data;
}
export async function generateItinerary(
  destination: string,
  budget: number,
  days: number
) {
  const response = await fetch(`${API_URL}/ai/itinerary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destination,
      budget,
      days,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to generate itinerary."
    );
  }

  return data;
}
export async function saveItinerary(
  tripId: string,
  itinerary: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/trips/${tripId}/itinerary`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        itinerary,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to save itinerary");
  }

  return data;
}
export async function getSavedItinerary(
  tripId: string,
  token: string
) {
  const response = await fetch(
    `${API_URL}/trips/${tripId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );
  

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to load itinerary"
    );
  }

  return data.itinerary;
}
// ==========================================
// COMMUNITY TRAVEL TIPS
// ==========================================

export type TravelTipCategory =
  | "Food"
  | "Hidden Gem"
  | "Hotel"
  | "Safety"
  | "Transport"
  | "Shopping"
  | "Other";

export type TravelTipSort =
  | "helpful"
  | "newest"
  | "upvoted";

export interface TravelTipAuthor {
  _id: string;
  name: string;
  badge?: string;
  points?: number;
}

export interface TravelTip {
  _id: string;

  destination: string;

  title: string;

  description: string;

  category: TravelTipCategory;

  author: TravelTipAuthor;

  upvotes: number;

  downvotes: number;

  createdAt: string;

  updatedAt: string;
}

export interface CreateTravelTipPayload {
  destination: string;

  title: string;

  description: string;

  category: TravelTipCategory;
}


// ==========================================
// GET TRAVEL TIPS
// ==========================================

export async function getTravelTips(
  destination: string,
  sort: TravelTipSort = "helpful"
): Promise<TravelTip[]> {

  const response = await fetch(
    `${API_URL}/travel-tips/${encodeURIComponent(
      destination
    )}?sort=${sort}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data?.message ||
        "Failed to fetch community travel tips"
    );

  }

  return data;
}


// ==========================================
// CREATE TRAVEL TIP
// ==========================================

export async function createTravelTip(
  payload: CreateTravelTipPayload,
  token: string
) {

  const response = await fetch(
    `${API_URL}/travel-tips`,
    {
      method: "POST",

      headers: {

        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,

      },

      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data?.message ||
        "Failed to share travel tip"
    );

  }

  return data;
}


// ==========================================
// UPVOTE TRAVEL TIP
// ==========================================

export async function upvoteTravelTip(
  tipId: string,
  token: string
) {

  const response = await fetch(
    `${API_URL}/travel-tips/${tipId}/upvote`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data?.message ||
        "Failed to upvote travel tip"
    );

  }

  return data;
}


// ==========================================
// DOWNVOTE TRAVEL TIP
// ==========================================

export async function downvoteTravelTip(
  tipId: string,
  token: string
) {

  const response = await fetch(
    `${API_URL}/travel-tips/${tipId}/downvote`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {

    throw new Error(
      data?.message ||
        "Failed to downvote travel tip"
    );

  }

  return data;
}


// ==========================================
// DELETE TRAVEL TIP
// ==========================================

export async function deleteTravelTip(
  tipId: string,
  token: string
) {

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
      data?.message ||
        "Failed to delete travel tip"
    );

  }

  return data;
}
// ==========================================
// USER PROFILE
// ==========================================

export interface ProfileUser {
  _id: string;
  name: string;
  email: string;
  points: number;
  badge: string;
  rank: number;
}

export interface ProfileStats {
  totalTips: number;
  totalUpvotes: number;
  totalDownvotes: number;
}

export interface ProfileTip {
  _id: string;
  destination: string;
  title: string;
  description: string;
  category: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface UserProfile {
  user: ProfileUser;
  stats: ProfileStats;
  tips: ProfileTip[];
}

export async function getMyProfile(
  token: string
): Promise<UserProfile> {

  const response = await fetch(
    `${API_URL}/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Failed to fetch profile"
    );
  }

  return data;
}