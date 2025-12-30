import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { codigo } = body;

        if (!codigo) {
            return NextResponse.json(
                { error: "Código de turno requerido" },
                { status: 400 }
            );
        }

        // Buscar el turno
        const turno = await prisma.turno.findFirst({
            where: { codigo },
        });

        if (!turno) {
            return NextResponse.json(
                { error: "No se encontró ningún turno con ese código" },
                { status: 404 }
            );
        }

        // Verificar que el turno no esté ya cancelado o completado
        if (turno.estado === "CANCELADO") {
            return NextResponse.json(
                { error: "Este turno ya fue cancelado" },
                { status: 400 }
            );
        }

        if (turno.estado === "COMPLETADO") {
            return NextResponse.json(
                { error: "No se puede cancelar un turno completado" },
                { status: 400 }
            );
        }

        // Verificar que falten al menos 12 horas para el turno
        const ahora = new Date();
        const fechaTurno = new Date(turno.fecha);
        const horasRestantes = (fechaTurno.getTime() - ahora.getTime()) / (1000 * 60 * 60);

        if (horasRestantes < 12) {
            return NextResponse.json(
                { error: "No se puede cancelar el turno. Debe hacerlo con al menos 12 horas de anticipación" },
                { status: 400 }
            );
        }

        // Cancelar el turno
        const turnoActualizado = await prisma.turno.update({
            where: { id: turno.id },
            data: {
                estado: "CANCELADO",
                motivo: "Cancelado por el paciente desde la web",
            },
        });

        return NextResponse.json({
            ok: true,
            turno: turnoActualizado,
            message: "Turno cancelado exitosamente",
        });
    } catch (error) {
        console.error("Error cancelando turno:", error);
        return NextResponse.json(
            { error: "Error al cancelar el turno" },
            { status: 500 }
        );
    }
}
