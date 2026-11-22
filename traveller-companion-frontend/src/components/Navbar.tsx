
"use client";

import Link from "next/link";
import { Menu, Plane, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");

      setIsLoggedIn(Boolean(token));
      setIsChecking(false);
    };

    // Initial authentication check
    checkAuth();

    // Listen for login/logout events in the same tab
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    localStorage.removeItem("redirectAfterLogin");

    setIsLoggedIn(false);
    setMenuOpen(false);

    // Notify other components
    window.dispatchEvent(new Event("auth-change"));

    router.replace("/login");
    router.refresh();
  };

  // Close mobile menu
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Navigation link styling
  const linkClass =
    "font-medium text-slate-700 transition hover:text-blue-600";

  const mobileLinkClass =
    "block px-6 py-4 text-slate-700 transition hover:bg-slate-100";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 shadow-sm backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
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

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-7 md:flex">

          <Link href="/" className={linkClass}>
            Home
          </Link>

          <Link href="/create-trip" className={linkClass}>
            Create Trip
          </Link>

          <Link href="/my-trips" className={linkClass}>
            My Trips
          </Link>

          <Link href="/#destinations" className={linkClass}>
            Explore
          </Link>

          <Link href="/leaderboard" className={linkClass}>
            Leaderboard
          </Link>

          {isLoggedIn && (
            <Link href="/profile" className={linkClass}>
              Profile
            </Link>
          )}

        </div>

        {/* DESKTOP LOGIN / LOGOUT */}
        <div className="hidden md:block">

          {!isChecking && (
            isLoggedIn ? (
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
            )
          )}

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          className="text-slate-900 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">

          <Link
            href="/"
            className={mobileLinkClass}
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            href="/create-trip"
            className={mobileLinkClass}
            onClick={closeMenu}
          >
            Create Trip
          </Link>

          <Link
            href="/my-trips"
            className={mobileLinkClass}
            onClick={closeMenu}
          >
            My Trips
          </Link>

          <Link
            href="/#destinations"
            className={mobileLinkClass}
            onClick={closeMenu}
          >
            Explore
          </Link>

          <Link
            href="/leaderboard"
            className={mobileLinkClass}
            onClick={closeMenu}
          >
            Leaderboard
          </Link>

          {isLoggedIn && (
            <Link
              href="/profile"
              className={mobileLinkClass}
              onClick={closeMenu}
            >
              Profile
            </Link>
          )}

          {!isChecking && (
            isLoggedIn ? (
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
                onClick={closeMenu}
              >
                Login
              </Link>
            )
          )}

        </div>
      )}

    </nav>
  );
}
