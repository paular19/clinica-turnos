import { NextResponse } from "next/server";
import { getTurnoByCodigo } from "@/lib/queries/turnos";
import { cancelarTurno as cancelarTurnoServer } from "@/lib/actions/serverTurnos";

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

        await cancelarTurnoServer({
            turnoId: turno.id,
            motivo: "Cancelación solicitada por el paciente",
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error("POST /api/mis-turnos/cancelar error", error);
        return NextResponse.json(
            { error: error?.message || "Error al cancelar el turno" },
            { status: 500 }
        );
    }
}
