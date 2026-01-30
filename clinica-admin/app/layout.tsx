import React from "react";
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = {
  title: "Clínica Admin - Panel de Administración",
  description: "Sistema de gestión administrativa para clínicas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className="min-h-screen bg-gray-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
