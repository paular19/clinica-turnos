import { NextResponse } from "next/server";
import { getTurnoByCodigo } from "@/lib/queries/turnos";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const codigo = (body?.codigo || "").toString().trim();

        if (!codigo) {
            return NextResponse.json({ error: "Código requerido" }, { status: 400 });
        }

        const turno = await getTurnoByCodigo(codigo);

        if (!turno) {
            return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
        }

        return NextResponse.json({ turno });
    } catch (error) {
        console.error("POST /api/mis-turnos/buscar error", error);
        return NextResponse.json({ error: "Error al buscar el turno" }, { status: 500 });
    }
}
