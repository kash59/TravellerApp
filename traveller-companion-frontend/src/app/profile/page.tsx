"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Award,
  MapPin,
  Medal,
  MessageSquareText,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  User,
} from "lucide-react";

import {
  getMyProfile,
  type UserProfile,
} from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD LOGGED-IN USER PROFILE
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const data = await getMyProfile(token);

        setProfile(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-slate-600">
          Loading your profile...
        </p>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">

          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load profile
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
          >
            Go Home
          </Link>

        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const { user, stats, tips } = profile;

  const initial =
    user.name?.charAt(0).toUpperCase() || "T";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-7xl">

        {/* ====================================== */}
        {/* PROFILE HEADER */}
        {/* ====================================== */}

        <section className="rounded-[32px] bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white shadow-xl md:p-12">

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* AVATAR */}

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white/30 bg-white text-4xl font-extrabold text-blue-600 shadow-lg">
                {initial}
              </div>

              {/* USER INFO */}

              <div>

                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  <User size={18} />
                  Traveler Profile
                </p>

                <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
                  {user.name}
                </h1>

                <p className="mt-2 text-blue-100">
                  {user.email}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">

                  {/* BADGE */}

                  <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">

                    <Award size={17} />

                    {user.badge}

                  </span>

                  {/* RANK */}

                  <span className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">

                    <Trophy size={17} />

                    Rank #{user.rank}

                  </span>

                </div>

              </div>

            </div>

            {/* COMMUNITY POINTS */}

            <div className="rounded-3xl bg-white/15 px-10 py-7 text-center backdrop-blur-md">

              <Trophy className="mx-auto h-8 w-8" />

              <p className="mt-3 text-4xl font-extrabold">
                {user.points}
              </p>

              <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-blue-100">
                Community Points
              </p>

            </div>

          </div>

        </section>

        {/* ====================================== */}
        {/* STATS */}
        {/* ====================================== */}

        <section className="mt-8 grid gap-5 md:grid-cols-3">

          {/* TIPS SHARED */}

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <MessageSquareText size={24} />
            </div>

            <p className="mt-5 text-4xl font-extrabold text-slate-900">
              {stats.totalTips}
            </p>

            <p className="mt-1 text-slate-500">
              Travel Tips Shared
            </p>

          </div>

          {/* UPVOTES */}

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ThumbsUp size={24} />
            </div>

            <p className="mt-5 text-4xl font-extrabold text-slate-900">
              {stats.totalUpvotes}
            </p>

            <p className="mt-1 text-slate-500">
              Upvotes Received
            </p>

          </div>

          {/* DOWNVOTES */}

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ThumbsDown size={24} />
            </div>

            <p className="mt-5 text-4xl font-extrabold text-slate-900">
              {stats.totalDownvotes}
            </p>

            <p className="mt-1 text-slate-500">
              Downvotes Received
            </p>

          </div>

        </section>

        {/* ====================================== */}
        {/* MY CONTRIBUTIONS */}
        {/* ====================================== */}

        <section className="mt-12">

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="font-semibold uppercase tracking-widest text-cyan-600">
                My Contributions
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Travel Tips You&apos;ve Shared
              </h2>

              <p className="mt-2 text-slate-500">
                See the recommendations you&apos;ve shared
                with the traveler community.
              </p>

            </div>

            <Link
              href="/#destinations"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
            >
              Explore Destinations
            </Link>

          </div>

          {/* ==================================== */}
          {/* NO CONTRIBUTIONS */}
          {/* ==================================== */}

          {tips.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <MessageSquareText
                size={42}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No travel tips yet
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-slate-500">
                Explore a destination and share a hidden
                gem or useful local recommendation with
                other travelers.
              </p>

              <Link
                href="/#destinations"
                className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white"
              >
                Explore Destinations
              </Link>

            </div>

          ) : (

            /* ================================== */
            /* USER'S TRAVEL TIPS */
            /* ================================== */

            <div className="grid gap-6 lg:grid-cols-2">

              {tips.map((tip) => (

                <article
                  key={tip._id}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* CATEGORY / DESTINATION */}

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <span className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                      {tip.category}
                    </span>

                    <span className="flex items-center gap-2 text-sm font-medium text-slate-500">

                      <MapPin size={16} />

                      {tip.destination}

                    </span>

                  </div>

                  {/* TITLE */}

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    {tip.title}
                  </h3>

                  {/* DESCRIPTION */}

                  <p className="mt-3 leading-7 text-slate-600">
                    {tip.description}
                  </p>

                  {/* VOTES + LINK */}

                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <span className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 font-semibold text-green-700">

                        <ThumbsUp size={17} />

                        {tip.upvotes || 0}

                      </span>

                      <span className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-600">

                        <ThumbsDown size={17} />

                        {tip.downvotes || 0}

                      </span>

                    </div>

                    <Link
                      href={`/recommendations/${encodeURIComponent(
                        tip.destination
                      )}`}
                      className="font-semibold text-cyan-600 transition hover:text-cyan-700"
                    >
                      View Destination →
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* ====================================== */}
        {/* LEADERBOARD */}
        {/* ====================================== */}

        <section className="mt-12 rounded-3xl bg-slate-900 p-8 text-white md:flex md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <Medal className="text-yellow-400" />

              <h2 className="text-2xl font-bold">
                Keep climbing the leaderboard
              </h2>

            </div>

            <p className="mt-3 max-w-2xl text-slate-300">
              Share useful travel tips and receive upvotes
              from other travelers to earn more community
              points.
            </p>

          </div>

          <Link
            href="/leaderboard"
            className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 md:mt-0"
          >
            View Leaderboard
          </Link>

        </section>

      </div>

    </main>
  );
}