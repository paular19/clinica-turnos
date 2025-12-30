import { NextResponse, NextRequest } from "next/server";
import { getTurnoByCodigo } from "../../../../../lib/queries/turnos";
import { generateComprobantePDF } from "../../../../../lib/pdf/generateComprobante";

export async function GET(
    request: NextRequest,
    { params }: { params: { codigo: string } }
) {
    try {
        const { codigo } = params;

        if (!codigo) {
            return NextResponse.json({ error: "codigo is required" }, { status: 400 });
        }

        const turno = await getTurnoByCodigo(codigo);
        if (!turno) {
            return NextResponse.json({ error: "turno not found" }, { status: 404 });
        }

        const { buffer, filename } = await generateComprobantePDF(turno.id, turno.clinicId);

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Length": String(buffer.length),
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (err: any) {
        console.error("PDF download error:", err);
        return NextResponse.json({ error: err?.message || "internal error" }, { status: 500 });
    }
}
