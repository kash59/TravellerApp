import { Plane } from "lucide-react";

export default function FlightPath() {
  return (
    <div className="absolute inset-0 pointer-events-none">

      <svg
        className="w-full h-full"
        viewBox="0 0 1000 1000"
      >
        <path
          d="M100 850 C320 600 650 320 900 120"
          stroke="#67E8F9"
          strokeWidth="2"
          strokeDasharray="12 12"
          fill="none"
        />
      </svg>

      <Plane
        className="absolute top-28 right-36 rotate-45 text-cyan-300"
        size={24}
      />

    </div>
  );
}