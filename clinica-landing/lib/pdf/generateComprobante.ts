import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getPrisma } from "@/lib/db/prisma";
const prisma = getPrisma();


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
  const page = doc.addPage([595, 842]); // A4 size
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - 80;

  // Header - Título principal
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.29, 0.74, 0.89), // #4bbde3
  });

  page.drawText("COMPROBANTE DE TURNO", {
    x: margin,
    y: height - 60,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText(turno.clinic?.name || "Clínica San Rafael", {
    x: margin,
    y: height - 85,
    size: 12,
    font: fontRegular,
    color: rgb(0.95, 0.95, 0.95),
  });

  yPosition = height - 140;

  // Código de turno destacado
  page.drawRectangle({
    x: margin,
    y: yPosition - 60,
    width: width - margin * 2,
    height: 70,
    color: rgb(0.94, 0.97, 0.99),
    borderColor: rgb(0.29, 0.74, 0.89),
    borderWidth: 2,
  });

  page.drawText("Código de Turno:", {
    x: margin + 20,
    y: yPosition - 30,
    size: 11,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(turno.codigo, {
    x: margin + 20,
    y: yPosition - 52,
    size: 28,
    font: fontBold,
    color: rgb(0.29, 0.74, 0.89),
  });

  yPosition -= 100;

  // Formatear fecha
  const fechaFormateada = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(turno.fecha));

  // Función helper para dibujar filas de información
  const drawInfoRow = (label: string, value: string, y: number) => {
    page.drawText(label, {
      x: margin,
      y,
      size: 11,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(value, {
      x: margin + 150,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Línea separadora
    page.drawLine({
      start: { x: margin, y: y - 8 },
      end: { x: width - margin, y: y - 8 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
  };

  // Sección de detalles
  page.drawText("DETALLES DEL TURNO", {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  yPosition -= 30;

  drawInfoRow("Fecha y hora:", fechaFormateada, yPosition);
  yPosition -= 35;

  drawInfoRow("Profesional:", turno.profesional?.nombre || "-", yPosition);
  yPosition -= 35;

  drawInfoRow("Especialidad:", turno.especialidad?.nombre || "-", yPosition);
  yPosition -= 35;

  drawInfoRow("Estado:", turno.estado, yPosition);
  yPosition -= 50;

  // Sección de datos del paciente
  page.drawText("DATOS DEL PACIENTE", {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  yPosition -= 30;

  drawInfoRow(
    "Nombre completo:",
    `${turno.paciente.nombre} ${turno.paciente.apellido}`,
    yPosition
  );
  yPosition -= 35;

  drawInfoRow("DNI:", turno.paciente.dni, yPosition);
  yPosition -= 35;

  drawInfoRow("Email:", turno.paciente.email, yPosition);
  yPosition -= 35;

  if (turno.paciente.telefono) {
    drawInfoRow("Teléfono:", turno.paciente.telefono, yPosition);
    yPosition -= 35;
  }

  // Nota importante
  yPosition -= 20;
  page.drawRectangle({
    x: margin,
    y: yPosition - 50,
    width: width - margin * 2,
    height: 60,
    color: rgb(1, 0.95, 0.8),
    borderColor: rgb(1, 0.76, 0.03),
    borderWidth: 1,
  });

  page.drawText("[ ! ]  IMPORTANTE", {
    x: margin + 15,
    y: yPosition - 22,
    size: 11,
    font: fontBold,
    color: rgb(0.5, 0.3, 0),
  });

  page.drawText("Presentarse 15 minutos antes de la hora del turno.", {
    x: margin + 15,
    y: yPosition - 38,
    size: 10,
    font: fontRegular,
    color: rgb(0.5, 0.3, 0),
  });

  // Footer
  page.drawLine({
    start: { x: margin, y: 80 },
    end: { x: width - margin, y: 80 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText("Este comprobante es válido para presentar el día de su turno", {
    x: margin,
    y: 60,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText(`Generado el ${new Date().toLocaleDateString("es-AR")}`, {
    x: margin,
    y: 45,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });

  const buffer = await doc.save();
  const filename = `comprobante-${turno.codigo || turnoId}.pdf`;
  return { buffer: Buffer.from(buffer), filename };
}