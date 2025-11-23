import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { prisma } from "../db/prisma";

export async function generateComprobantePDF(turnoId: string, clinicId?: string) {
  // fetch turno with relations
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
    include: {
      paciente: true,
      profesional: true,
      especialidad: true,
      clinic: true
    }
  });

  if (!turno) {
    throw new Error("Turno not found");
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 400]);
  const times = await doc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  page.drawText("Comprobante de Turno", { x: 50, y: height - 60, size: 18, font: times, color: rgb(0, 0, 0) });
  page.drawText(`Código: ${turno.codigo}`, { x: 50, y: height - 90, size: 12, font: times });
  page.drawText(`Paciente: ${turno.paciente.nombre} ${turno.paciente.apellido} (DNI: ${turno.paciente.dni})`, { x: 50, y: height - 110, size: 12, font: times });
  page.drawText(`Profesional: ${turno.profesional?.nombre || "-"}`, { x: 50, y: height - 130, size: 12, font: times });
  page.drawText(`Especialidad: ${turno.especialidad?.nombre || "-"}`, { x: 50, y: height - 150, size: 12, font: times });
  page.drawText(`Fecha: ${turno.fecha.toISOString()}`, { x: 50, y: height - 170, size: 12, font: times });
  page.drawText(`Estado: ${turno.estado}`, { x: 50, y: height - 190, size: 12, font: times });

  const buffer = await doc.save();
  const filename = `comprobante-${turno.codigo || turnoId}.pdf`;
  return { buffer: Buffer.from(buffer), filename };
}
