import React from "react";
import { listEspecialidades } from "../../lib/queries/especialidades";

export default async function Home() {
  // for demo, no clinicId; list none
  const especialidades = [];
  try {
    // if a default clinic exists, you could fetch; keep safe
  } catch (err) {
    console.error(err);
  }

  return (
    <div>
      <h1>Bienvenido a Turnos App</h1>
      <p>Reservá tu turno en línea de forma simple y rápida.</p>
      <p>
        Ir a la sección de <a href="/turnos">Turnos</a>
      </p>
      <section style={{ marginTop: 24 }}>
        <h2>Especialidades</h2>
        {especialidades.length === 0 ? <p>No hay especialidades cargadas (ejecutá el seed o admin).</p> : null}
      </section>
    </div>
  );
}
