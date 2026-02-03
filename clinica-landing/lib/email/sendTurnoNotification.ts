import { render } from "@react-email/render";
import TurnoNotificationEmail from "./TurnoNotificationEmail";
import { Turno, Paciente } from "@prisma/client";

type NotificationType = "creacion" | "cancelacion" | "reprogramacion";

type TurnoWithRelations = Partial<Turno> & {
    especialidad?: { nombre?: string };
    profesional?: { nombre?: string };
};

let resend: any = null;

// Inicializar Resend si está disponible
if (process.env.RESEND_API_KEY) {
    try {
        const { Resend } = require("resend");
        resend = new Resend(process.env.RESEND_API_KEY);
    } catch (err) {
        console.warn("⚠️  Resend no está instalado. Instala con: npm install resend");
    }
}

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
            const result = await resend.emails.send({
                from: process.env.RESEND_FROM || "Clínica San Rafael <noreply@clinicasanrafael.com>",
                to,
                subject: asuntoMap[tipo],
                html,
            });

            if (result.error) {
                throw new Error(`Resend error: ${result.error.message}`);
            }

            console.log(`✅ Email enviado exitosamente a: ${to} (Resend)`);
            return result.id;
        } else {
            // Fallback: Modo desarrollo (loguear a consola)
            console.log(`⚠️  Modo desarrollo: Email JSON generado (no enviado)`);
            console.log(JSON.stringify({ to, subject: asuntoMap[tipo], html }, null, 2));
            return `dev-${Date.now()}`;
        }
    } catch (err) {
        console.error(`❌ Error enviando email a ${to}:`, err);
        throw err;
    }
}
