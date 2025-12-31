import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import ConfirmationEmail from "./ConfirmationEmail";
import { Turno, Paciente } from "@prisma/client";

type EmailPayload = {
  to: string;
  turno: Partial<Turno> & { especialidad?: { nombre?: string }; profesional?: { nombre?: string } };
  paciente: Partial<Paciente>;
  pdfUrl?: string;
};

export async function sendConfirmationEmail(payload: EmailPayload) {
  const { to, turno, paciente, pdfUrl } = payload;

  const html = await render(
    // @ts-ignore - React Email component
    ConfirmationEmail({ turno, paciente, pdfUrl })
  );

  const transporter = createTransporter();

  console.log(`📧 Enviando email de confirmación a: ${to}`);
  console.log(`   Turno código: ${turno.codigo}`);
  console.log(`   PDF URL: ${pdfUrl}`);

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || `no-reply@${process.env.NEXT_PUBLIC_URL?.replace(/^https?:\/\//, "") || "localhost"}`,
    to,
    subject: `Confirmación de turno ${turno.codigo || ""}`,
    html,
    text: `Confirmación de turno ${turno.codigo || ""} - ${pdfUrl || ""}`
  });

  if (info.envelope) {
    console.log(`✅ Email enviado exitosamente a: ${to}`);
  } else {
    console.log(`⚠️  Modo desarrollo: Email JSON generado (no enviado) - Message ID: ${info.messageId}`);
  }

  return info.messageId;
}

function createTransporter() {
  if (process.env.RESEND_API_KEY) {
    // Resend doesn't have a standard nodemailer transporter; but for simplicity, use SMTP fallback.
    // If SMTP env provided, use it:
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Create a stub transporter that logs to console (development friendly)
    return nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user,
      pass
    }
  });
}
