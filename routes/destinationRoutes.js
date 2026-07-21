const express = require("express");

const router = express.Router();

// ==========================================
// SEARCH DESTINATION
// GET /api/destinations/search?city=Agra
// ==========================================

router.get("/search", async (req, res) => {
  try {
    const city = req.query.city;

    if (!city || !city.trim()) {
      return res.status(400).json({
        message: "Destination is required",
      });
    }

    const searchQuery = encodeURIComponent(
      `${city.trim()}, India`
    );

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent":
            "TravellerCompanion/1.0",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Unable to search destination"
      );
    }

    const results = await response.json();

    if (!results.length) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    // Prefer city/town-like results when possible
    const bestResult =
      results.find(
        (result) =>
          result.addresstype === "city" ||
          result.addresstype === "town" ||
          result.addresstype === "municipality"
      ) || results[0];

    res.status(200).json({
      name:
        bestResult.address?.city ||
        bestResult.address?.town ||
        bestResult.address?.municipality ||
        city.trim(),

      displayName: bestResult.display_name,

      location: {
        latitude: Number(bestResult.lat),
        longitude: Number(bestResult.lon),
      },
    });
  } catch (error) {
    console.error(
      "Destination Search Error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to search destination",
    });
  }
});
      
 // ==========================================
// GET TOURIST PLACES NEAR DESTINATION
// GET /api/destinations/places?lat=27.175&lng=78.009
// ==========================================

router.get("/places", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        message: "Invalid coordinates",
      });
    }

    // 10 km radius
    const radius = 10000;

    const query = `
      [out:json][timeout:20];
      (
        nwr["tourism"="attraction"](around:${radius},${latitude},${longitude});
        nwr["tourism"="museum"](around:${radius},${latitude},${longitude});
        nwr["tourism"="viewpoint"](around:${radius},${latitude},${longitude});
        nwr["historic"="monument"](around:${radius},${latitude},${longitude});
        nwr["historic"="memorial"](around:${radius},${latitude},${longitude});
        nwr["historic"="archaeological_site"](around:${radius},${latitude},${longitude});
        nwr["historic"="castle"](around:${radius},${latitude},${longitude});
      );
      out center tags;
    `;

    const overpassServers = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    let data = null;
    let lastError = null;

    // Try more than one public Overpass instance
    for (const server of overpassServers) {
      try {
        const url =
          `${server}?data=${encodeURIComponent(query)}`;

        console.log(
          "Trying Overpass server:",
          server
        );

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent":
              "TravellerCompanion/1.0",
          },
        });

        if (!response.ok) {
          const errorText =
            await response.text();

          console.error(
            `Overpass ${response.status}:`,
            errorText.slice(0, 300)
          );

          throw new Error(
            `Overpass returned ${response.status}`
          );
        }

        data = await response.json();

        break;
      } catch (error) {
        console.error(
          "Overpass server failed:",
          server,
          error.message
        );

        lastError = error;
      }
    }

    if (!data) {
      throw (
        lastError ||
        new Error(
          "All Overpass servers failed"
        )
      );
    }

    // ==========================================
    // FORMAT RESULTS
    // ==========================================

    const places = data.elements
      .map((element) => {
        const name =
          element.tags?.name;

        const placeLatitude =
          element.lat ??
          element.center?.lat;

        const placeLongitude =
          element.lon ??
          element.center?.lon;

        if (
          !name ||
          placeLatitude == null ||
          placeLongitude == null
        ) {
          return null;
        }

        return {
          name,

          latitude:
            Number(placeLatitude),

          longitude:
            Number(placeLongitude),

          type:
            element.tags?.tourism ||
            element.tags?.historic ||
            "attraction",
        };
      })

      .filter(Boolean)

      // Remove duplicate place names
      .filter(
        (place, index, array) =>
          array.findIndex(
            (item) =>
              item.name
                .toLowerCase() ===
              place.name.toLowerCase()
          ) === index
      )

      .slice(0, 15);

    return res.status(200).json({
      count: places.length,
      places,
    });

  } catch (error) {

    console.error(
      "Dynamic Places Error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load tourist attractions",

      // Helpful while developing
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});
module.exports = router;