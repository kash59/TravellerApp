import { LucideIcon } from "lucide-react";

interface SocialButtonProps {
  icon: LucideIcon;
  text: string;
  onClick?: () => void;
}

export default function SocialButton({
  icon: Icon,
  text,
  onClick,
}: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-5
        py-4
        font-medium
        shadow-sm
        transition-all
        hover:shadow-lg
        hover:-translate-y-1
      "
    >
      <Icon size={22} />
      {text}
    </button>
  );
}
