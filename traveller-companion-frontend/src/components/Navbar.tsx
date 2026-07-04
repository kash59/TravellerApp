"use client";

import Link from "next/link";
import { Menu, Plane, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 p-2">
            <Plane className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Traveller
            </h1>
            <p className="-mt-1 text-xs text-slate-500">
              AI Companion
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-8 md:flex">
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

          <Link
            href="/suggestions"
            className="font-medium text-slate-700 transition hover:text-blue-600"
          >
            Suggestions
          </Link>
        </div>

        {/* Login Button */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 font-medium text-white shadow-md transition hover:scale-105"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t bg-white md:hidden">

          <Link
            href="/"
            className="block px-6 py-4 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/create-trip"
            className="block px-6 py-4 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Create Trip
          </Link>

          <Link
            href="/my-trips"
            className="block px-6 py-4 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            My Trips
          </Link>

          <Link
            href="/suggestions"
            className="block px-6 py-4 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Suggestions
          </Link>

          <Link
            href="/login"
            className="block px-6 py-4 font-semibold text-blue-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>

        </div>
      )}
    </nav>
  );
}