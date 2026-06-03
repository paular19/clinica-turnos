"use server";


import {
  crearTurnoSchema,
  CrearTurnoInput,
  cancelarTurnoSchema,
  CancelarTurnoInput,
  reprogramTurnoSchema,
  ReprogramTurnoInput,
} from "../zod/schemas";
import { genCodigo, sanitizeString, parseISO } from "../utils/sanitize";
import { sendTurnoNotification } from "../email/sendTurnoNotification";
import { revalidatePaths } from "../utils/revalidate";
import { getTurnoByCodigo } from "../queries/turnos";
import { generateComprobantePDF } from "../pdf/generateComprobante";
import { z } from "zod";
import { getPrisma } from "@/lib/db/prisma";
const prisma = getPrisma();
const SYNTHETIC_EMAIL_DOMAIN = "noemail.local";


/* ---------------------------- Helpers ---------------------------- */

const CLINIC_TZ = "America/Argentina/Buenos_Aires";

function getClinicDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return {
    diaSemana: weekdayMap[weekday] ?? 1,
    minutos: hour * 60 + minute,
  };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function buildSyntheticEmail(dni: string, clinicId: string) {
  const safeDni = dni.replace(/\D/g, "") || "sin-dni";
  const safeClinic = clinicId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().slice(0, 12) || "clinic";
  return `${safeDni}.${safeClinic}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

function isRealPacienteEmail(email?: string | null) {
  return !!email && !email.endsWith(`@${SYNTHETIC_EMAIL_DOMAIN}`);
}

async function validarSlotYCompatibilidad(tx: any, params: {
  clinicId: string;
  profesionalId: string;
  especialidadId: string;
  obraSocialId?: string | null;
  fecha: Date;
  ignoreTurnoId?: string; // para reprogramar (ignorar el turno original)
}) {
  const { clinicId, profesionalId, especialidadId, obraSocialId, fecha, ignoreTurnoId } = params;

  // Profesional + especialidad
  const profesional = await tx.profesional.findFirst({
    where: {
      id: profesionalId,
      clinicId,
      especialidades: { some: { id: especialidadId } },
    },
    select: { id: true },
  });
  if (!profesional) throw new Error("El profesional no atiende esa especialidad.");

  // Obra social (si viene)
  if (obraSocialId) {
    const acepta = await tx.profesionalObraSocial.findFirst({
      where: { clinicId, profesionalId, obraSocialId },
      select: { profesionalId: true },
    });
    if (!acepta) throw new Error("El profesional no atiende con esa obra social.");
  }

  // Horario válido ese día + alineación al intervalo
  const { diaSemana, minutos } = getClinicDateParts(fecha);
  const horarios = await tx.horario.findMany({
    where: { clinicId, profesionalId, diaSemana },
    select: { horaInicio: true, horaFin: true, intervaloMin: true },
  });
  if (!horarios.length) throw new Error("El médico no atiende ese día.");

  const okSlot = horarios.some((h: any) => {
    const start = toMinutes(h.horaInicio);
    const end = toMinutes(h.horaFin);
    const step = h.intervaloMin || 45;

    if (minutos < start || minutos >= end) return false;
    return (minutos - start) % step === 0;
  });

  if (!okSlot) throw new Error("Horario inválido para la agenda del médico.");

  // Conflicto (doble booking)
  const conflicto = await tx.turno.findFirst({
    where: {
      clinicId,
      profesionalId,
      fecha,
      NOT: { estado: "CANCELADO" },
      ...(ignoreTurnoId ? { NOT: [{ id: ignoreTurnoId }, { estado: "CANCELADO" }] } : {}),
    },
    select: { id: true },
  });

  // Nota: el NOT de arriba es redundante pero seguro.
  if (conflicto) throw new Error("Ese horario ya fue reservado.");
}

/* ---------------------------- Actions ---------------------------- */

export async function crearTurno(data: CrearTurnoInput) {
  try {
    // Log para debugging
    console.log("Datos recibidos en crearTurno:", JSON.stringify(data, null, 2));

    const parseResult = crearTurnoSchema.safeParse(data);

    if (!parseResult.success) {
      console.error("Error de validación Zod:", parseResult.error.format());
      throw new Error(`Validación fallida: ${JSON.stringify(parseResult.error.format())}`);
    }

    const parsed = parseResult.data;

    parsed.paciente.nombre = sanitizeString(parsed.paciente.nombre);
    parsed.paciente.apellido = sanitizeString(parsed.paciente.apellido);
    if (parsed.paciente.email) {
      parsed.paciente.email = sanitizeString(parsed.paciente.email).toLowerCase();
    }
    parsed.paciente.telefono = sanitizeString(parsed.paciente.telefono);

    const emailParaCrear = parsed.paciente.email || buildSyntheticEmail(parsed.paciente.dni, parsed.clinicId);

    const fecha = parseISO(parsed.fecha);

    const result = await prisma.$transaction(async (tx) => {
      await validarSlotYCompatibilidad(tx, {
        clinicId: parsed.clinicId,
        profesionalId: parsed.profesionalId,
        especialidadId: parsed.especialidadId,
        obraSocialId: parsed.paciente.obraSocialId,
        fecha,
      });

      const paciente = await tx.paciente.upsert({
        where: { dni_clinicId: { dni: parsed.paciente.dni, clinicId: parsed.clinicId } },
        update: {
          nombre: parsed.paciente.nombre,
          apellido: parsed.paciente.apellido,
          email: parsed.paciente.email || undefined,
          telefono: parsed.paciente.telefono,
          obraSocialId: parsed.paciente.obraSocialId || undefined,
        },
        create: {
          nombre: parsed.paciente.nombre,
          apellido: parsed.paciente.apellido,
          dni: parsed.paciente.dni,
          email: emailParaCrear,
          telefono: parsed.paciente.telefono,
          obraSocialId: parsed.paciente.obraSocialId || undefined,
          clinicId: parsed.clinicId,
        },
      });

      const codigo = genCodigo();

      const turno = await tx.turno.create({
        data: {
          fecha,
          // Confirm new turnos automáticamente para evitar el paso manual de aprobación
          estado: "CONFIRMADO",
          motivo: parsed.motivo,
          codigo,
          pacienteId: paciente.id,
          profesionalId: parsed.profesionalId,
          especialidadId: parsed.especialidadId,
          clinicId: parsed.clinicId,
        },
      });

      return { turno, paciente };
    });

    await revalidatePaths([`/turnos/confirmacion`, `/admin/turnos`, `/medico`]);

    // Email con datos reales
    try {
      const turnoFull = await prisma.turno.findUnique({
        where: { id: result.turno.id },
        include: { profesional: true, especialidad: true, paciente: true },
      });

      if (turnoFull && isRealPacienteEmail(turnoFull.paciente.email)) {
        await sendTurnoNotification(
          turnoFull.paciente.email,
          turnoFull,
          turnoFull.paciente,
          "creacion"
        );
      }
    } catch (err) {
      console.error("Failed to send notification email", err);
    }

    return { turnoId: result.turno.id, codigo: result.turno.codigo };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("Validation error:", JSON.stringify(err.issues, null, 2));
      throw err;
    }
    console.error("crearTurno error", err);
    throw err; // Throw the actual error instead of wrapping it
  }
}

export async function cancelarTurno(input: CancelarTurnoInput) {
  try {
    const parsed = cancelarTurnoSchema.parse(input as any);

    const where: any = {};
    if (parsed.turnoId) where.id = parsed.turnoId;
    if (parsed.codigo) where.codigo = parsed.codigo;

    // Obtener el turno antes de actualizar para acceder a los datos
    const turnoAnterior = await prisma.turno.findFirst({
      where,
      include: {
        paciente: true,
        profesional: true,
        especialidad: true,
      },
    });

    const turno = await prisma.turno.updateMany({
      where,
      data: { estado: "CANCELADO", motivo: parsed.motivo },
    });

    // Enviar notificación de cancelación si encontramos el turno
    if (isRealPacienteEmail(turnoAnterior?.paciente?.email)) {
      try {
        await sendTurnoNotification(
          turnoAnterior.paciente.email,
          turnoAnterior,
          turnoAnterior.paciente,
          "cancelacion",
          parsed.motivo || undefined
        );
      } catch (err) {
        console.error("Error enviando email de cancelación:", err);
      }
    }

    await revalidatePaths([`/admin/turnos`, `/medico`]);

    return { ok: true, updated: turno.count };
  } catch (err) {
    if (err instanceof z.ZodError) throw err;
    console.error(err);
    throw new Error("Error cancelling turno");
  }
}

export async function reprogramarTurno(input: ReprogramTurnoInput) {
  try {
    const parsed = reprogramTurnoSchema.parse(input as any);

    const where: any = {};
    if (parsed.turnoId) where.id = parsed.turnoId;
    if (parsed.codigo) where.codigo = parsed.codigo;

    const existing = await prisma.turno.findFirst({
      where,
      include: { paciente: true },
    });

    if (!existing) throw new Error("Turno not found");

    const nuevaFecha = parseISO(parsed.nuevaFecha);

    const result = await prisma.$transaction(async (tx) => {
      // validar nuevo slot (misma especialidad, mismo profesional, misma obra social del paciente)
      await validarSlotYCompatibilidad(tx, {
        clinicId: existing.clinicId,
        profesionalId: existing.profesionalId,
        especialidadId: existing.especialidadId,
        obraSocialId: existing.paciente?.obraSocialId,
        fecha: nuevaFecha,
        ignoreTurnoId: existing.id,
      });

      await tx.turno.update({
        where: { id: existing.id },
        data: { estado: "REPROGRAMADO", motivo: parsed.motivo },
      });

      const newCodigo = genCodigo();

      const newTurno = await tx.turno.create({
        data: {
          fecha: nuevaFecha,
          estado: "PENDIENTE",
          motivo: parsed.motivo,
          codigo: newCodigo,
          pacienteId: existing.pacienteId,
          profesionalId: existing.profesionalId,
          especialidadId: existing.especialidadId,
          clinicId: existing.clinicId,
        },
      });

      return { newTurno };
    });

    await revalidatePaths([`/turnos/confirmacion`, `/admin/turnos`, `/medico`]);

    try {
      const turnoFull = await prisma.turno.findUnique({
        where: { id: result.newTurno.id },
        include: { paciente: true, profesional: true, especialidad: true },
      });

      if (turnoFull && isRealPacienteEmail(turnoFull.paciente.email)) {
        // Enviar notificación de reprogramación
        await sendTurnoNotification(
          turnoFull.paciente.email,
          turnoFull,
          turnoFull.paciente,
          "reprogramacion",
          turnoFull.motivo || undefined
        );
      }
    } catch (err) {
      console.error("Failed to send reprogram email", err);
    }

    return { turnoId: result.newTurno.id, codigo: result.newTurno.codigo };
  } catch (err) {
    if (err instanceof z.ZodError) throw err;
    console.error(err);
    throw new Error("Error reprogramming turno");
  }
}

/** Obtiene un turno por código (public) */
export async function getTurnoForPublic(codigo: string) {
  try {
    const turno = await getTurnoByCodigo(codigo);
    if (!turno) throw new Error("Turno not found");
    return turno;
  } catch (err) {
    console.error("getTurnoForPublic error:", err);
    throw new Error("Error fetching turno");
  }
}

/** Genera PDF del comprobante de turno (server-side only) */
export async function generateTurnoPDF(codigo: string) {
  try {
    const turno = await getTurnoByCodigo(codigo);
    if (!turno) throw new Error("Turno not found");
    const { buffer, filename } = await generateComprobantePDF(turno.id, turno.clinicId);
    return { buffer, filename };
  } catch (err) {
    console.error("generateTurnoPDF error:", err);
    throw new Error("Error generating PDF");
  }
}

/** Exporta turnos de una clínica en CSV (server-side only) */
export async function exportTurnosCSV(clinicId: string) {
  try {
    const turnos = await prisma.turno.findMany({
      where: { clinicId },
      include: { paciente: true, profesional: true, especialidad: true },
      orderBy: { fecha: "desc" },
      take: 10000,
    });

    const header = ["fecha", "codigo", "paciente_dni", "paciente_nombre", "profesional", "especialidad", "estado"];
    const rows = turnos.map((t: any) => [
      t.fecha.toISOString(),
      t.codigo,
      t.paciente?.dni || "",
      `${t.paciente?.nombre || ""} ${t.paciente?.apellido || ""}`.trim(),
      t.profesional?.nombre || "",
      t.especialidad?.nombre || "",
      t.estado,
    ]);

    const csv = [header.join(","), ...rows.map((r: any) => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n")].join("\r\n");
    return { csv, filename: `turnos-${clinicId}.csv` };
  } catch (err) {
    console.error("exportTurnosCSV error:", err);
    throw new Error("Error exporting CSV");
  }
}

/**
 * Pública (landing): ahora recibe IDs porque el médico es obligatorio
 * Recomendación: llamar directamente a `crearTurno` desde tu UI de steps,
 * pero si querés FormData, esta action queda.
 */
export async function solicitudTurnoPublica(formData: FormData) {
  try {
    const clinicId = formData.get("clinicId") as string;
    const especialidadId = formData.get("especialidadId") as string;
    const obraSocialId = (formData.get("obraSocialId") as string) || "";
    const profesionalId = formData.get("profesionalId") as string;

    const fecha = formData.get("fecha") as string; // "YYYY-MM-DD"
    const hora = formData.get("hora") as string;   // "HH:MM"

    const dni = formData.get("dni") as string;
    const nombre = formData.get("nombre") as string;
    const apellido = (formData.get("apellido") as string) || "";
    const email = ((formData.get("email") as string) || "").trim();
    const telefono = (formData.get("telefono") as string) || "";

    if (!clinicId) throw new Error("Clinic requerida");
    if (!especialidadId) throw new Error("Especialidad requerida");
    if (!obraSocialId) throw new Error("Obra social requerida");
    if (!profesionalId) throw new Error("Profesional requerido");
    if (!fecha || !hora) throw new Error("Fecha/hora requerida");
    if (!dni) throw new Error("DNI requerido");
    if (!nombre || nombre.length < 2) throw new Error("Nombre inválido");
    if (!telefono.trim()) throw new Error("Telefono requerido");
    if (email && !email.includes("@")) throw new Error("Email inválido");

    const fechaISO = `${fecha}T${hora}`;
    const fechaHora = new Date(fechaISO);
    if (isNaN(fechaHora.getTime())) throw new Error("Fecha/hora inválida");

    const input: CrearTurnoInput = {
      clinicId,
      profesionalId,
      especialidadId,
      fecha: fechaHora.toISOString(),
      motivo: "Solicitud web",
      paciente: {
        dni,
        nombre,
        apellido,
        email: email || undefined,
        telefono,
        obraSocialId,
      },
    } as any;

    const res = await crearTurno(input);

    return { success: true, codigo: res.codigo };
  } catch (error: any) {
    console.error("solicitudTurnoPublica error:", error);
    return { success: false, message: error.message || "Error al procesar la solicitud" };
  }
}
