"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Input from "@/components/ui/Input";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export default function PasswordInput({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter your password",
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">

      <Input
        label={label}
        icon={Lock}
        type={showPassword ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        error={error}
        onChange={(e) => onChange(e.target.value)}
        className="pr-12"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="
          absolute
          right-5
          top-[50px]
          text-slate-500
          hover:text-cyan-600
          transition
        "
      >
        {showPassword ? (
          <EyeOff size={22} />
        ) : (
          <Eye size={22} />
        )}
      </button>

    </div>
  );
}