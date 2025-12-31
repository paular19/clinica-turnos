import { NextRequest, NextResponse } from "next/server";
import { generateComprobantePDF } from "@/lib/pdf/generateComprobante";
import { prisma } from "@/lib/db/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ codigo: string }> }
) {
    try {
        const { codigo } = await params;

        if (!codigo) {
            return NextResponse.json({ error: "Código requerido" }, { status: 400 });
        }

        // Buscar turno por código
        const turno = await prisma.turno.findUnique({
            where: { codigo },
            select: { id: true, clinicId: true },
        });

        if (!turno) {
            return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
        }

        // Generar PDF
        const { buffer, filename } = await generateComprobantePDF(turno.id, turno.clinicId);

        // Retornar PDF
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Error generando PDF:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            {
                error: "Error generando comprobante",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}