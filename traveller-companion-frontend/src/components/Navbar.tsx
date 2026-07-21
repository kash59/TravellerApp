"use client";

import Link from "next/link";
import { Menu, Plane, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check whether token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setMenuOpen(false);

    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* ========================= */}
        {/* LOGO */}
        {/* ========================= */}

        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 p-2">
            <Plane className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Traveller
            </h1>

            <p className="-mt-1 text-xs text-slate-500">
              Companion
            </p>
          </div>
        </Link>

        {/* ========================= */}
        {/* DESKTOP MENU */}
        {/* ========================= */}

        <div className="hidden items-center gap-7 md:flex">

          <Link
            href="/"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/create-trip"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Create Trip
          </Link>

          <Link
            href="/my-trips"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            My Trips
          </Link>

          {/* 
            We do NOT use /suggestions here because
            you do not currently have:
            src/app/suggestions/page.tsx

            Your Explore flow already exists on Home:
            FeaturedDestinations
              ↓
            Explore button
              ↓
            /recommendations/[city]
          */}

          <Link
            href="/#destinations"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Explore
          </Link>

          <Link
            href="/leaderboard"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Leaderboard
          </Link>

          {/* Only show Profile when logged in */}

          {isLoggedIn && (
            <Link
              href="/profile"
              className="font-medium text-slate-700 transition hover:text-blue-600"
            >
              Profile
            </Link>
          )}

        </div>

        {/* ========================= */}
        {/* DESKTOP AUTH BUTTON */}
        {/* ========================= */}

        <div className="hidden md:block">

          {isLoggedIn ? (

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white shadow-md transition hover:scale-105"
            >
              Logout
            </button>

          ) : (

            <Link
              href="/login"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white shadow-md transition hover:scale-105"
            >
              Login
            </Link>

          )}

        </div>

        {/* ========================= */}
        {/* MOBILE MENU BUTTON */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="text-slate-900 md:hidden"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>

      </div>

      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">

          <Link
            href="/"
            className="block px-6 py-4 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/create-trip"
            className="block px-6 py-4 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Create Trip
          </Link>

          <Link
            href="/my-trips"
            className="block px-6 py-4 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            My Trips
          </Link>

          <Link
            href="/#destinations"
            className="block px-6 py-4 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Explore
          </Link>

          <Link
            href="/leaderboard"
            className="block px-6 py-4 text-slate-700 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Leaderboard
          </Link>

          {/* PROFILE */}

          {isLoggedIn && (
            <Link
              href="/profile"
              className="block px-6 py-4 text-slate-700 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
          )}

          {/* LOGIN / LOGOUT */}

          {isLoggedIn ? (

            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-6 py-4 text-left font-semibold text-blue-600 hover:bg-slate-100"
            >
              Logout
            </button>

          ) : (

            <Link
              href="/login"
              className="block px-6 py-4 font-semibold text-blue-600 hover:bg-slate-100"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

          )}

        </div>
      )}

    </nav>
  );
}