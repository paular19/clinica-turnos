import React from "react";
import { getTurnoByCodigo } from "../../../../lib/queries/turnos";

type Props = { params: { codigo: string } };

export default async function TurnoByCodigo({ params }: Props) {
  const { codigo } = params;
  const turno = await getTurnoByCodigo(codigo).catch(() => null);
  if (!turno) {
    return (
      <div>
        <h2>Turno no encontrado</h2>
        <p>Código: {codigo}</p>
      </div>
    );
  }
  return (
    <div>
      <h2>Turno {turno.codigo}</h2>
      <p>
        Paciente: {turno.paciente.nombre} {turno.paciente.apellido}
      </p>
      <p>Fecha: {turno.fecha.toISOString()}</p>
      <p>Profesional: {turno.profesional?.nombre}</p>
      <p>
        Descargar comprobante: <a href={`/api/turnos/pdf?codigo=${turno.codigo}`}>PDF</a>
      </p>
    </div>
  );
}
