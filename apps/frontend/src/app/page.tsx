import "./globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
  auth,
  protected: protectedRoute,
}: {
  children: ReactNode;
  auth: ReactNode;
  protected: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Default route */}
        {children}

        {/* Parallel route groups */}
        {auth}
        {protectedRoute}
      </body>
    </html>
  );
}
