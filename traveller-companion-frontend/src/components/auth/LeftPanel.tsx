import FloatingBlob from "./FloatingBlob";
import FlightPath from "./FlightPath";
import StatsCard from "./StatsCard";

import { Plane, Sparkles } from "lucide-react";

export default function LeftPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex flex-1">

      {/* Background */}

      <div
        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
        style={{
          backgroundImage: "url('/images/auth-bg.jpg')",
        }}
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/80 via-blue-900/60 to-slate-900/80" />

      {/* Blobs */}

      <FloatingBlob className="top-10 left-12 w-40 h-40" />

      <FloatingBlob className="bottom-10 left-20 w-72 h-72" />

      <FloatingBlob className="top-1/3 right-12 w-52 h-52" />

      {/* Flight */}

      <FlightPath />

      {/* Content */}

      <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 text-white">

        {/* Logo */}

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/20 p-4 backdrop-blur">

            <Plane size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-bold">
              Traveller Companion
            </h1>

            <p className="text-cyan-100">
              AI Powered Travel
            </p>

          </div>

        </div>

        {/* Heading */}

        <div className="max-w-xl">

          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-5 py-2 backdrop-blur">

            <Sparkles size={18} />

            AI Powered Travel Planner

          </span>

          <h2 className="mt-8 text-6xl font-black leading-tight">

            Discover

            <br />

            <span className="text-cyan-300">
              Your Next
            </span>

            <br />

            Adventure

          </h2>

          <p className="mt-6 text-lg leading-8 text-cyan-100">

            Create trips, discover amazing places,
            generate AI itineraries and travel smarter.

          </p>

        </div>

        {/* Bottom Card */}

        <StatsCard />

      </div>

    </div>
  );
}