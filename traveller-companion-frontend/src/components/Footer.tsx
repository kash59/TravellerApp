import Container from "@/components/ui/Container";

export default function Footer() {
  return (
    <footer className="bg-slate-900 py-14 text-white">

      <Container>

        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">

          <div>

            <h2 className="text-2xl font-bold">
              🌍 Traveller Companion
            </h2>

            <p className="mt-2 text-slate-400">
              AI Powered Travel Planning
            </p>

          </div>

          <div className="flex gap-8 text-slate-300">

            <a href="/">Home</a>

            <a href="/my-trips">Trips</a>

            <a href="/login">Login</a>

          </div>

        </div>

        <hr className="my-8 border-slate-700" />

        <p className="text-center text-slate-400">
          © 2026 Traveller Companion. All Rights Reserved.
        </p>

      </Container>

    </footer>
  );
}