import React from "react";
import { getTurnoByCodigo } from "../../../../lib/queries/turnos";

type Props = { searchParams: { codigo?: string } };

export default async function Confirmacion({ searchParams }: Props) {
  const codigo = searchParams.codigo;
  if (!codigo) {
    return <div>No se recibió código de turno</div>;
  }
  const turno = await getTurnoByCodigo(codigo).catch(() => null);
  if (!turno) return <div>Turno no encontrado</div>;
  return (
    <div>
      <h1>Turno confirmado</h1>
      <p>Código: {turno.codigo}</p>
      <p>Fecha: {turno.fecha.toISOString()}</p>
      <p>Paciente: {turno.paciente.nombre} {turno.paciente.apellido}</p>
    </div>
  );
}
