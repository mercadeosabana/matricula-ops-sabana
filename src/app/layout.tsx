import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matrícula Ops · Facultad de Educación",
  description:
    "Ops de matrícula maestrías · Universidad de La Sabana · Cohorte 2027-1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-cream text-navy">
        {children}
      </body>
    </html>
  );
}
