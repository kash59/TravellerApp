const API_URL = "http://localhost:5000/api";

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
  const response = await fetch("http://localhost:5000/api/ai/itinerary", {
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
    throw new Error(data.message || "Failed to generate itinerary");
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