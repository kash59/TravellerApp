
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Login failed. Please check your credentials."
        );
      }

      if (!data?.token) {
        throw new Error(
          "Login response did not contain an authentication token."
        );
      }

      // Save authentication session
      sessionStorage.setItem("token", data.token);

      if (data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
      } else {
        sessionStorage.removeItem("user");
      }

      // Notify Navbar about successful login
      window.dispatchEvent(new Event("auth-change"));

      // Get saved redirect destination
      const savedRedirect = localStorage.getItem("redirectAfterLogin");

      const redirectAfterLogin =
        savedRedirect?.startsWith("/") &&
        !savedRedirect.startsWith("//")
          ? savedRedirect
          : "/";

      localStorage.removeItem("redirectAfterLogin");

      // Navigate after login
      router.replace(redirectAfterLogin);
      router.refresh();

    } catch (loginError) {
      console.error("Login error:", loginError);

      if (
        loginError instanceof DOMException &&
        loginError.name === "AbortError"
      ) {
        setError(
          "Login timed out. Please check your internet connection and try again."
        );
      } else if (loginError instanceof Error) {
        setError(loginError.message);
      } else {
        setError("Unable to connect to the server. Please try again.");
      }

    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-500">
            Welcome back
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            Login
          </h1>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              placeholder="you@example.com"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-gray-900 disabled:bg-gray-100"
              placeholder="Enter your password"
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-black px-6 py-4 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* REGISTER LINK */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}

          <Link
            href="/register"
            className="font-semibold text-gray-900 underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>

      </div>
    </main>
  );
}
