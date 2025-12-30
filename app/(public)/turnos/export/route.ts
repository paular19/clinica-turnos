import { NextResponse, NextRequest } from "next/server";
import { exportTurnosCSV } from "../../../../lib/actions/serverTurnos";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const clinicId = url.searchParams.get("clinicId");
        if (!clinicId) return NextResponse.json({ error: "clinicId required" }, { status: 400 });

        const { csv, filename } = await exportTurnosCSV(clinicId);

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="${filename}"`
            }
        });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err?.message || "internal error" }, { status: 500 });
    }
}
