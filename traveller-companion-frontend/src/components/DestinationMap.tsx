"use client";

import { useEffect } from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// ==========================================
// LEAFLET MARKER ICON
// ==========================================

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});

// ==========================================
// TYPES
// ==========================================

type PlaceLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

interface DestinationMapProps {
  city: string;
  latitude: number;
  longitude: number;
  placeLocations?: PlaceLocation[];
}

// ==========================================
// AUTO FIT MAP TO ALL MARKERS
// ==========================================

function FitMapBounds({
  cityPosition,
  placeLocations,
}: {
  cityPosition: [number, number];
  placeLocations: PlaceLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    // City + all attraction coordinates
    const positions: [number, number][] = [
      cityPosition,

      ...placeLocations.map(
        (place) =>
          [
            place.latitude,
            place.longitude,
          ] as [number, number]
      ),
    ];

    // If attractions exist, fit all markers on screen
    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 11,
      });
    } else {
      // If there are no attraction markers,
      // just center the map on the city
      map.setView(cityPosition, 11);
    }
  }, [
    map,
    cityPosition[0],
    cityPosition[1],
    placeLocations,
  ]);

  return null;
}

// ==========================================
// DESTINATION MAP
// ==========================================

export default function DestinationMap({
  city,
  latitude,
  longitude,
  placeLocations = [],
}: DestinationMapProps) {
  // City center coordinates
  const cityPosition: [number, number] = [
    latitude,
    longitude,
  ];

  // ==========================================
  // GOOGLE MAPS DIRECTIONS LINK
  // No Google Maps API key required
  // ==========================================

  const getDirectionsUrl = (
    placeLatitude: number,
    placeLongitude: number
  ) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${placeLatitude},${placeLongitude}`;
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <MapContainer
        center={cityPosition}
        zoom={9}
        scrollWheelZoom={false}
        className="h-[450px] w-full"
      >

        {/* ==================================
            OPENSTREETMAP TILES
        ================================== */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ==================================
            AUTOMATICALLY FIT ALL MARKERS
        ================================== */}

        <FitMapBounds
          cityPosition={cityPosition}
          placeLocations={placeLocations}
        />

        {/* ==================================
            CITY MARKER
        ================================== */}

        <Marker
          position={cityPosition}
          icon={markerIcon}
        >
          <Popup>

            <div className="min-w-[130px]">

              <strong className="text-base">
                {city}
              </strong>

              <p className="mt-1 text-sm">
                Explore {city}
              </p>

            </div>

          </Popup>
        </Marker>

        {/* ==================================
            ATTRACTION MARKERS
        ================================== */}

        {placeLocations.map((place) => (

          <Marker
            key={place.name}
            position={[
              place.latitude,
              place.longitude,
            ]}
            icon={markerIcon}
          >

            <Popup>

              <div className="min-w-[150px]">

                {/* PLACE NAME */}

                <strong className="text-base">
                  {place.name}
                </strong>

                {/* CITY */}

                <p className="mt-1 text-sm">
                  {city}
                </p>

                {/* GET DIRECTIONS */}

                <a
                  href={getDirectionsUrl(
                    place.latitude,
                    place.longitude
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-semibold text-blue-600 hover:text-blue-700"
                >
                  Get Directions →
                </a>

              </div>

            </Popup>

          </Marker>

        ))}

      </MapContainer>

    </div>
  );
}