const API_URL = "http://localhost:5000/api";

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
