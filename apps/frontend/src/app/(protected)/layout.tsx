export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* navbar, sidebar, etc. */}
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  );
}
