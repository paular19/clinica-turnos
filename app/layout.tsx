import React from "react";
import "../styles/globals.css";

export const metadata = {
  title: "Turnos App",
  description: "Gestión de turnos para clínicas"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <a href="/" style={{ fontWeight: 700, fontSize: 18 }}>
              Turnos App
            </a>
          </div>
        </header>
        <main style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>{children}</main>
        <footer style={{ padding: 24, borderTop: "1px solid #eee", marginTop: 48 }}>
          <div style={{ maxWidth: 960, margin: "0 auto", color: "#666" }}>© {new Date().getFullYear()} Turnos App</div>
        </footer>
      </body>
    </html>
  );
}
