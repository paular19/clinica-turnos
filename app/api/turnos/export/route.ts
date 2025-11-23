import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const clinicId = url.searchParams.get("clinicId");
    if (!clinicId) return NextResponse.json({ error: "clinicId required" }, { status: 400 });

    const turnos = await prisma.turno.findMany({
      where: { clinicId },
      include: { paciente: true, profesional: true, especialidad: true },
      orderBy: { fecha: "desc" },
      take: 10000
    });

    const header = ["fecha", "codigo", "paciente_dni", "paciente_nombre", "profesional", "especialidad", "estado"];
    const rows = turnos.map((t) => [
      t.fecha.toISOString(),
      t.codigo,
      t.paciente?.dni || "",
      `${t.paciente?.nombre || ""} ${t.paciente?.apellido || ""}`.trim(),
      t.profesional?.nombre || "",
      t.especialidad?.nombre || "",
      t.estado
    ]);

    const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="turnos-${clinicId}.csv"`
      }
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message || "internal error" }, { status: 500 });
  }
}
