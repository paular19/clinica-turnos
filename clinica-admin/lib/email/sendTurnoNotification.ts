import { render } from "@react-email/render";
import TurnoNotificationEmail from "./TurnoNotificationEmail";
import { Turno, Paciente } from "@prisma/client";
import { Resend } from "resend";

type NotificationType = "creacion" | "cancelacion" | "reprogramacion";

type TurnoWithRelations = Partial<Turno> & {
    especialidad?: { nombre?: string };
    profesional?: { nombre?: string };
};

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

console.log("🔧 Resend inicializado:", resend ? "✅ CON API KEY" : "⚠️  SIN API KEY");

export async function sendTurnoNotification(
    to: string,
    turno: TurnoWithRelations,
    paciente: Partial<Paciente>,
    tipo: NotificationType,
    motivo?: string
) {
    const html = await render(
        // @ts-ignore - React Email component
        TurnoNotificationEmail({ turno, paciente, tipo, motivo })
    );

    const asuntoMap = {
        creacion: `Turno confirmado - ${turno.codigo || ""}`,
        cancelacion: `Turno cancelado - ${turno.codigo || ""}`,
        reprogramacion: `Turno reprogramado - ${turno.codigo || ""}`,
    };

    console.log(`📧 Enviando email de ${tipo} a: ${to}`);
    console.log(`   Turno código: ${turno.codigo}`);

    try {
        if (resend) {
            // Usar Resend si está configurado
            console.log("📨 Enviando con Resend...");
            const result = await resend.emails.send({
                from: process.env.RESEND_FROM || "Clínica San Rafael <noreply@clinicasanrafael.com>",
                to,
                subject: asuntoMap[tipo],
                html,
            });

            console.log("Resultado Resend:", JSON.stringify(result, null, 2));

            if (result.error) {
                throw new Error(`Resend error: ${result.error.message}`);
            }

            console.log(`✅ Email enviado exitosamente a: ${to} (Resend ID: ${result.data?.id})`);
            return result.data?.id || `success-${Date.now()}`;
        } else {
            // Fallback: Modo desarrollo (loguear a consola)
            console.log(`⚠️  ADVERTENCIA: Resend NO está configurado. Email NO se envió.`);
            console.log(`API_KEY: ${process.env.RESEND_API_KEY ? "✅ Presente" : "❌ FALTANTE"}`);
            console.log(JSON.stringify({ to, subject: asuntoMap[tipo] }, null, 2));
            return `dev-${Date.now()}`;
        }
    } catch (err) {
        console.error(`❌ Error enviando email a ${to}:`, err);
        throw err;
    }
}
