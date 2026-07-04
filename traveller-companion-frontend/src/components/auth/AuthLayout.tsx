interface AuthLayoutProps {
  left: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthLayout({
  left,
  children,
}: AuthLayoutProps) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-slate-100">
      {/* Left Side */}
      {left}

      {/* Right Side */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        {children}
      </div>
    </main>
  );
}