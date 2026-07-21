"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  Star,
  Users,
} from "lucide-react";

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  badge: string;
}

const API_URL = "http://localhost:5000/api";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/users/leaderboard`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load leaderboard."
        );
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load leaderboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) {
      return <Trophy size={24} className="text-yellow-500" />;
    }

    if (rank === 2) {
      return <Medal size={24} className="text-slate-500" />;
    }

    if (rank === 3) {
      return <Award size={24} className="text-amber-600" />;
    }

    return (
      <span className="font-bold text-slate-500">
        #{rank}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <p className="text-center text-lg text-slate-600">
          Loading leaderboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <section className="rounded-[32px] bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-10 text-white shadow-xl">

          <div className="flex items-center gap-3 text-cyan-100">
            <Trophy size={22} />

            <span className="font-semibold uppercase tracking-widest">
              Traveller Community
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">
            Community Leaderboard
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-cyan-50">
            Share useful travel tips, help other travelers
            discover hidden gems and climb the leaderboard.
          </p>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}

        {!error && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <Users className="text-cyan-600" />

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {users.length}
              </p>

              <p className="mt-1 text-slate-500">
                Top Contributors
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <Star className="text-amber-500" />

              <p className="mt-4 text-3xl font-bold text-slate-900">
                {users[0]?.points ?? 0}
              </p>

              <p className="mt-1 text-slate-500">
                Highest Community Points
              </p>

            </div>

          </div>
        )}

        {/* LEADERBOARD */}

        {!error && (
          <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-6">

              <h2 className="text-2xl font-bold text-slate-900">
                Top Travelers
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ranked according to community contribution points.
              </p>

            </div>

            {users.length === 0 ? (

              <div className="p-12 text-center">

                <Trophy
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-xl font-bold text-slate-800">
                  No contributors yet
                </h3>

                <p className="mt-2 text-slate-500">
                  Share travel tips to become the first
                  community contributor.
                </p>

              </div>

            ) : (

              <div>

                {users.map((user, index) => {

                  const rank = index + 1;

                  return (
                    <div
                      key={user._id}
                      className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-100 px-6 py-5 last:border-b-0 hover:bg-slate-50"
                    >

                      {/* LEFT */}

                      <div className="flex items-center gap-5">

                        <div className="flex h-12 w-12 items-center justify-center">
                          {getRankIcon(rank)}
                        </div>

                        {/* AVATAR */}

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-lg font-bold text-cyan-700">

                          {user.name
                            ?.charAt(0)
                            .toUpperCase() || "T"}

                        </div>

                        {/* USER */}

                        <div>

                          <h3 className="font-bold text-slate-900">
                            {user.name}
                          </h3>

                          <span className="mt-1 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {user.badge || "Explorer"}
                          </span>

                        </div>

                      </div>

                      {/* POINTS */}

                      <div className="text-right">

                        <p className="text-xl font-extrabold text-cyan-700">
                          {user.points ?? 0}
                        </p>

                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Points
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </section>

        )}

        {/* HOW POINTS WORK */}

        <section className="mt-8 rounded-3xl bg-slate-900 p-8 text-white">

          <h2 className="text-2xl font-bold">
            How do I earn points?
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl bg-white/10 p-5">
              <strong>+10 points</strong>

              <p className="mt-1 text-sm text-slate-300">
                Share a useful community travel tip.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <strong>+2 points</strong>

              <p className="mt-1 text-sm text-slate-300">
                Receive an upvote from another traveler.
              </p>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}