import React from "react";

type Props = {
  turno: any;
  paciente: any;
  pdfUrl?: string;
};

export default function ConfirmationEmail({ turno, paciente, pdfUrl }: Props) {
  return (
    <html>
      <body style={{ fontFamily: "Arial, sans-serif", color: "#111", lineHeight: 1.4 }}>
        <h2>Confirmación de Turno</h2>
        <p>Hola {paciente?.nombre} {paciente?.apellido},</p>
        <p>Se ha generado el turno con código <strong>{turno?.codigo}</strong>.</p>
        <ul>
          <li>Fecha: {turno?.fecha?.toString?.() || turno?.fecha}</li>
          <li>Profesional: {turno?.profesional?.nombre || "-"}</li>
          <li>Especialidad: {turno?.especialidad?.nombre || "-"}</li>
        </ul>
        {pdfUrl ? (
          <p>
            Descargá tu comprobante: <a href={pdfUrl}>{pdfUrl}</a>
          </p>
        ) : null}
        <p>Gracias por elegirnos.</p>
      </body>
    </html>
  );
}
