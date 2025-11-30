"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validación local para clinica-landing
const solicitudTurnoSchema = z.object({
    nombre: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    fecha: z.string().min(1, "La fecha es requerida"),
    hora: z.string().min(1, "La hora es requerida"),
    especialidad: z.string().min(1, "Selecciona una especialidad")
});

type SolicitudTurnoInput = z.infer<typeof solicitudTurnoSchema>;

export async function solicitudTurno(formData: FormData) {
    try {
        const data = {
            nombre: formData.get("nombre") as string,
            email: formData.get("email") as string,
            fecha: formData.get("fecha") as string,
            hora: formData.get("hora") as string,
            especialidad: formData.get("especialidad") as string,
        };

        // Validar con Zod
        const parsed = solicitudTurnoSchema.parse(data);

        // TODO: Guardar en BD (por ahora solo log)
        console.log("Solicitud de turno recibida:", parsed);

        // TODO: Enviar email de confirmación

        revalidatePath("/turnos");

        return {
            success: true,
            message: "Solicitud de turno enviada. Recibirás confirmación por email."
        };
    } catch (error: any) {
        console.error("Error en solicitud de turno:", error);

        // Manejo de errores de Zod
        if (error.errors) {
            const firstError = error.errors[0];
            return {
                success: false,
                message: firstError.message || "Error en validación"
            };
        }

        return {
            success: false,
            message: "Ocurrió un error al procesar la solicitud"
        };
    }
}
