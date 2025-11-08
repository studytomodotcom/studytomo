import "./globals.css";
import { Inter } from "next/font/google";
import { ServiceWorkerRegister } from "./sw-register"; // ✅ import this

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "StudyTomo",
  description: "Cozy AI study companion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* PWA setup */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className={inter.className}>
        {/* ✅ Register service worker here */}
        <ServiceWorkerRegister />

        {/* App content */}
        {children}
      </body>
    </html>
  );
}
