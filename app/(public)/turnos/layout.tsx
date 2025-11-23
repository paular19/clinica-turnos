import React from "react";

export default function TurnosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{ marginBottom: 16 }}>
        <a href="/turnos" style={{ marginRight: 8 }}>
          Reservar Turno
        </a>
        <a href="/">Volver al inicio</a>
      </nav>
      <div>{children}</div>
    </div>
  );
}
