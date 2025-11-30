"use server";

/**
 * Importar y re-exportar desde lib de raíz
 * Esta es la acción que usa clinica-landing para solicitar turnos
 * 
 * En monorepo:
 * - /lib/actions/serverTurnos.ts = acciones admin (crear, editar, cancelar, reprogramar)
 * - /lib/actions/serverTurnos.ts::solicitudTurnoPublica = acción para landing
 * - clinica-landing/lib/actions/turnos.ts = envoltorio que importa desde raíz
 */

// Nota: No podemos importar directamente desde ../../../lib en Next.js
// porque los imports relativos desde clinica-landing no resuelven bien monorepos.
// En su lugar, la acción se duplica aquí pero con menor lógica.
// TODO: Considerar usar workspaces de npm o path aliases en tsconfig

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

        console.log("Solicitud de turno recibida (validada):", parsed);

        // TODO: Conectar con serverTurnos.solicitudTurnoPublica() de raíz
        // Por ahora solo valida y logea

        revalidatePath("/turnos");

        return {
            success: true,
            message: "Solicitud de turno enviada. Recibirás confirmación por email."
        };
    } catch (error: any) {
        console.error("Error en solicitud de turno:", error);

        // Manejo de errores de Zod
        if (error.errors && Array.isArray(error.errors)) {
            const firstError = error.errors[0];
            return {
                success: false,
                message: firstError.message || "Error en validación"
            };
        }

        return {
            success: false,
            message: error.message || "Ocurrió un error al procesar la solicitud"
        };
    }
}
