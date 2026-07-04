import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-[28px]
        border
        border-white/40
        bg-white/55
        backdrop-blur-xl
        shadow-xl
        p-6
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-2xl
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}