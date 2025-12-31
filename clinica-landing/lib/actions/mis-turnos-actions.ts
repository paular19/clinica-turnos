"use server";

import { getTurnoByCodigo } from "../queries/turnos";
import { cancelarTurno as cancelarTurnoServer } from "./serverTurnos";

export async function buscarTurnoPorCodigo(codigo: string) {
    return getTurnoByCodigo(codigo);
}

export async function cancelarTurno(codigo: string) {
    // Primero buscar el turno por código
    const turno = await getTurnoByCodigo(codigo);

    if (!turno) {
        throw new Error("Turno no encontrado");
    }

    // Cancelar el turno usando el ID
    return cancelarTurnoServer({
        turnoId: turno.id,
        motivo: "Cancelación solicitada por el paciente",
    });
}