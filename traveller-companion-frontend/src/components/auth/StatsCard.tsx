import Card from "@/components/ui/Card";
import {
  Plane,
  MapPin,
  Star,
} from "lucide-react";

export default function StatsCard() {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-xl">

      <div className="grid grid-cols-3 gap-6 text-center text-white">

        <div>
          <Plane className="mx-auto mb-3" />
          <h3 className="text-3xl font-bold">
            500+
          </h3>
          <p className="text-sm">
            Trips
          </p>
        </div>

        <div>
          <MapPin className="mx-auto mb-3" />
          <h3 className="text-3xl font-bold">
            120+
          </h3>
          <p className="text-sm">
            Cities
          </p>
        </div>

        <div>
          <Star className="mx-auto mb-3" />
          <h3 className="text-3xl font-bold">
            4.9
          </h3>
          <p className="text-sm">
            Rating
          </p>
        </div>

      </div>

    </Card>
  );
}