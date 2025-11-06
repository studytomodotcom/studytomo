import "@/app/globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import SupabaseProvider from "@/components/SupabaseProvider"; // ✅ new import

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-neutralBg text-gray-900">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* ✅ Wrap app in SupabaseProvider */}
        <SupabaseProvider>
          {/* 🔝 Navbar */}
          <header className="bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
              <Link href="/" className="font-bold text-xl text-primary hover:opacity-90">
                StudyTomo
              </Link>
              <nav className="flex space-x-6 text-sm font-medium text-gray-600">
                <Link href="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/progress" className="hover:text-primary">
                  Progress
                </Link>
                <Link href="/curriculum" className="hover:text-primary">
                  Library
                </Link>
              </nav>
            </div>
          </header>

          {/* 📘 Page */}
          <main className="flex-grow">{children}</main>

          {/* 🔚 Footer */}
          <footer className="border-t border-gray-100 py-4 text-center text-sm text-gray-500 bg-white">
            © {new Date().getFullYear()} StudyTomo. All rights reserved.
          </footer>
        </SupabaseProvider>
      </body>
    </html>
  );
}
