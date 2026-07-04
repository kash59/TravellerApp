import { InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export default function Input({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">

      {/* Label */}

      {label && (
        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Input */}

      <div
        className={`
          flex items-center
          rounded-2xl
          border
          ${
            error
              ? "border-red-400"
              : "border-white/40"
          }
          bg-white/70
          backdrop-blur-xl
          px-5
          py-4
          transition
          focus-within:border-cyan-500
          focus-within:ring-4
          focus-within:ring-cyan-200
        `}
      >

        {Icon && (
          <Icon
            size={22}
            className="mr-4 text-slate-400"
          />
        )}

        <input
          className={`
            w-full
            bg-transparent
            outline-none
            text-slate-800
            placeholder:text-slate-400
            ${className}
          `}
          {...props}
        />

      </div>

      {/* Error */}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}