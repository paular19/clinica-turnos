import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db/prisma";
import { getTurnoByCodigo } from "../../../lib/queries/turnos";
import { generateComprobantePDF } from "../../../lib/pdf/generateComprobante";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const codigo = url.searchParams.get("codigo");
    if (!codigo) {
      return NextResponse.json({ error: "codigo is required" }, { status: 400 });
    }

    // If ?pdf=1 return pdf
    const asPdf = url.searchParams.get("pdf") === "1" || url.pathname.endsWith("/pdf");

    if (asPdf || url.pathname.endsWith("/pdf")) {
      const turno = await prisma.turno.findUnique({ where: { codigo }, select: { id: true, clinicId: true } });
      if (!turno) return NextResponse.json({ error: "turno not found" }, { status: 404 });

      const { buffer, filename } = await generateComprobantePDF(turno.id, turno.clinicId);
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": String(buffer.length),
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    const turno = await getTurnoByCodigo(codigo);
    if (!turno) return NextResponse.json({ error: "turno not found" }, { status: 404 });

    return NextResponse.json({ data: turno });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "internal error" }, { status: 500 });
  }
}
