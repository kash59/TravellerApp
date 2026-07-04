"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { User, Mail } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import LeftPanel from "@/components/auth/LeftPanel";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialButton from "@/components/auth/SocialButton";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
const API_URL = "http://localhost:5000/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.errors?.[0]?.msg ||
            "Registration failed"
        );
      }

      setSuccess(
        "Account created successfully!"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

 return (
  <AuthLayout left={<LeftPanel />}>
    <Card className="w-full max-w-md rounded-[32px] bg-white/80 backdrop-blur-xl p-10 shadow-2xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          Create Account
        </h1>

        <p className="mt-3 text-slate-500">
          Start planning amazing journeys with AI.
        </p>
      </div>

      <form
        onSubmit={handleRegister}
        className="mt-8 space-y-5"
      >
        <Input
          label="Full Name"
          icon={User}
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          value={password}
          onChange={setPassword}
        />

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded"
          />

          <span>
            I agree to the{" "}
            <span className="font-semibold text-cyan-600">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="font-semibold text-cyan-600">
              Privacy Policy
            </span>
          </span>
        </label>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
        >
          Create Account
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-sm text-slate-400">
            OR
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-3">
          <SocialButton
            icon={Mail}
            text="Continue with Google"
          />

          <SocialButton
            icon={User}
            text="Continue with Apple"
          />
        </div>

        <p className="pt-3 text-center text-slate-600">
          Already have an account?

          <Link
            href="/login"
            className="ml-2 font-semibold text-cyan-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </Card>
  </AuthLayout>
);
}