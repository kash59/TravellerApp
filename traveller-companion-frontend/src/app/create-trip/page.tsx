import { Suspense } from "react";
import CreateTripForm from "./CreateTripForm";

export default function CreateTripPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-6 py-16 text-black">
          <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
            Loading create trip form...
          </div>
        </main>
      }
    >
      <CreateTripForm />
    </Suspense>
  );
}
