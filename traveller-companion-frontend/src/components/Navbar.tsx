export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b">
      <h1 className="text-2xl font-bold">
        Traveller Companion
      </h1>

      <div className="flex gap-6">
        <a href="/">Home</a>
        <a href="/trips">Trips</a>
        <a href="/suggestions">Suggestions</a>
      </div>
    </nav>
  );
}