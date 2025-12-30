import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db/prisma";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const codigo = searchParams.get("codigo");

        if (!codigo) {
            return NextResponse.json(
                { error: "Código de turno requerido" },
                { status: 400 }
            );
        }

        const turno = await prisma.turno.findFirst({
            where: { codigo },
            include: {
                paciente: {
                    select: {
                        nombre: true,
                        apellido: true,
                        dni: true,
                        email: true,
                    },
                },
                profesional: {
                    select: {
                        nombre: true,
                    },
                },
                especialidad: {
                    select: {
                        nombre: true,
                    },
                },
            },
        });

        if (!turno) {
            return NextResponse.json(
                { error: "No se encontró ningún turno con ese código" },
                { status: 404 }
            );
        }

        return NextResponse.json(turno);
    } catch (error) {
        console.error("Error buscando turno:", error);
        return NextResponse.json(
            { error: "Error al buscar el turno" },
            { status: 500 }
        );
    }
}
