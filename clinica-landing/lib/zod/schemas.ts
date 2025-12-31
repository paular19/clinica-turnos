import { z } from "zod";
import { isISODateTime } from "../utils/validators";

/**
 * Soporta IDs generados por Prisma en dos formatos comunes:
 * - UUID (String @db.Uuid)
 * - CUID (default de Prisma: cuid())
 */
const idSchema = z.union([z.string().uuid(), z.string().cuid()]);

export const pacienteSchema = z.object({
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  dni: z.string().min(6),
  email: z.string().email(),
  telefono: z.string().optional(),

  // Permite: UUID/CUID, o "" (lo transforma a undefined)
  obraSocialId: z
    .union([idSchema, z.literal("").transform(() => undefined)])
    .optional(),
});

export const crearTurnoSchema = z.object({
  clinicId: idSchema,
  profesionalId: idSchema,
  especialidadId: idSchema,
  fecha: z
    .string()
    .refine((v) => isISODateTime(v), { message: "fecha must be ISO datetime" }),
  paciente: pacienteSchema,
  motivo: z.string().max(500).optional(),
});

// Schema simple para solicitud de turno desde landing
export const solicitudTurnoSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  fecha: z.string().min(1, "La fecha es requerida"),
  hora: z.string().min(1, "La hora es requerida"),
  especialidad: z.string().min(1, "Selecciona una especialidad"),
});

export type SolicitudTurnoInput = z.infer<typeof solicitudTurnoSchema>;

export const reprogramTurnoSchema = z
  .object({
    codigo: z.string().min(4).optional(),
    turnoId: idSchema.optional(),
    nuevaFecha: z
      .string()
      .refine((v) => isISODateTime(v), { message: "nuevaFecha must be ISO datetime" }),
    motivo: z.string().max(500).optional(),
  })
  .refine((data) => !!data.codigo || !!data.turnoId, { message: "codigo or turnoId required" });

export const cancelarTurnoSchema = z
  .object({
    codigo: z.string().optional(),
    turnoId: idSchema.optional(),
    motivo: z.string().max(500).optional(),
  })
  .refine((data) => !!data.codigo || !!data.turnoId, { message: "codigo or turnoId required" });

export const crearProfesionalSchema = z.object({
  clinicId: idSchema,
  nombre: z.string().min(2),
  matricula: z.string().min(3),
  fotoUrl: z.string().url().optional(),

  // IDs de especialidades que atiende
  especialidadIds: z.array(idSchema).optional(),

  horarios: z
    .array(
      z.object({
        diaSemana: z.number().int().min(0).max(6),
        horaInicio: z.string(),
        horaFin: z.string(),
        intervaloMin: z.number().int().min(5),
      })
    )
    .optional(),

  clerkId: z.string().optional(),
});

export const crearEspecialidadSchema = z.object({
  clinicId: idSchema,
  nombre: z.string().min(2),
  duracion: z.number().int().min(5),
  descripcion: z.string().optional(),
});

export const registrarPacienteSchema = pacienteSchema.extend({
  clinicId: idSchema,
});

export type CrearTurnoInput = z.infer<typeof crearTurnoSchema>;
export type ReprogramTurnoInput = z.infer<typeof reprogramTurnoSchema>;
export type CancelarTurnoInput = z.infer<typeof cancelarTurnoSchema>;
export type CrearProfesionalInput = z.infer<typeof crearProfesionalSchema>;
export type CrearEspecialidadInput = z.infer<typeof crearEspecialidadSchema>;
export type RegistrarPacienteInput = z.infer<typeof registrarPacienteSchema>;
