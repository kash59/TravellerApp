const cities = [
  "Delhi",
  "Mumbai",
  "Jaipur",
  "Goa",
];

export default function FeaturedDestinations() {
  return (
    <section className="px-10 py-20">
      <h2 className="text-4xl font-bold mb-10">
        Popular Destinations
      </h2>

      <div className="grid md:grid-cols-4 gap-6">

        {cities.map((city) => (
          <div
            key={city}
            className="rounded-xl border p-8 shadow-sm hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold">
              {city}
            </h3>
          </div>
        ))}

      </div>
    </section>
  );
}