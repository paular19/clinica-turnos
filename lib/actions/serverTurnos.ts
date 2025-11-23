"use server";

import { prisma } from "../db/prisma";
import { crearTurnoSchema, CrearTurnoInput, cancelarTurnoSchema, CancelarTurnoInput, reprogramTurnoSchema, ReprogramTurnoInput } from "../zod/schemas";
import { genCodigo, sanitizeString, parseISO } from "../utils/sanitize";
import { sendConfirmationEmail } from "../email/sendConfirmationEmail";
import { revalidatePaths } from "../utils/revalidate";
import { z } from "zod";

export async function crearTurno(data: CrearTurnoInput) {
  try {
    const parsed = crearTurnoSchema.parse(data);
    // Basic sanitization
    parsed.paciente.nombre = sanitizeString(parsed.paciente.nombre);
    parsed.paciente.apellido = sanitizeString(parsed.paciente.apellido);
    parsed.paciente.email = sanitizeString(parsed.paciente.email);

    const fecha = parseISO(parsed.fecha);

    const result = await prisma.$transaction(async (tx) => {
      // upsert paciente by dni + clinicId
      const paciente = await tx.paciente.upsert({
        where: { dni_clinicId: { dni: parsed.paciente.dni, clinicId: parsed.clinicId } },
        update: {
          nombre: parsed.paciente.nombre,
          apellido: parsed.paciente.apellido,
          email: parsed.paciente.email,
          telefono: parsed.paciente.telefono || undefined,
          obraSocialId: parsed.paciente.obraSocialId || undefined
        },
        create: {
          nombre: parsed.paciente.nombre,
          apellido: parsed.paciente.apellido,
          dni: parsed.paciente.dni,
          email: parsed.paciente.email,
          telefono: parsed.paciente.telefono || undefined,
          obraSocialId: parsed.paciente.obraSocialId || undefined,
          clinicId: parsed.clinicId
        }
      });

      const codigo = genCodigo();

      const turno = await tx.turno.create({
        data: {
          fecha,
          estado: "PENDIENTE",
          motivo: parsed.motivo,
          codigo,
          pacienteId: paciente.id,
          profesionalId: parsed.profesionalId,
          especialidadId: parsed.especialidadId,
          clinicId: parsed.clinicId
        }
      });

      return { turno, paciente };
    });

    // Revalidate affected paths (public confirmation and admin)
    await revalidatePaths([`/turnos/confirmacion`, `/admin/turnos`, `/medico`]);

    // send email (best-effort)
    try {
      await sendConfirmationEmail({
        to: result.paciente.email,
        turno: {
          codigo: result.turno.codigo,
          fecha: result.turno.fecha,
          profesional: { nombre: "" },
          especialidad: { nombre: "" }
        },
        paciente: result.paciente,
        pdfUrl: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/turnos/pdf?codigo=${result.turno.codigo}`
      });
    } catch (err) {
      console.error("Failed to send confirmation email", err);
    }

    return { turnoId: result.turno.id, codigo: result.turno.codigo };
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw err;
    }
    console.error("crearTurno error", err);
    throw new Error("Error creating turno");
  }
}

export async function cancelarTurno(input: CancelarTurnoInput) {
  try {
    const parsed = cancelarTurnoSchema.parse(input as any);
    let where: any = {};
    if (parsed.turnoId) where.id = parsed.turnoId;
    if (parsed.codigo) where.codigo = parsed.codigo;

    const turno = await prisma.turno.updateMany({
      where,
      data: { estado: "CANCELADO", motivo: parsed.motivo }
    });

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
    let where: any = {};
    if (parsed.turnoId) where.id = parsed.turnoId;
    if (parsed.codigo) where.codigo = parsed.codigo;

    const nuevaFecha = parseISO(parsed.nuevaFecha);

    const existing = await prisma.turno.findFirst({ where });

    if (!existing) {
      throw new Error("Turno not found");
    }

    // Option: mark old turno REPROGRAMADO and create new turno with same paciente
    const result = await prisma.$transaction(async (tx) => {
      await tx.turno.update({
        where: { id: existing.id },
        data: { estado: "REPROGRAMADO", motivo: parsed.motivo }
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
          clinicId: existing.clinicId
        }
      });

      return { newTurno };
    });

    await revalidatePaths([`/turnos/confirmacion`, `/admin/turnos`, `/medico`]);

    // send emails best-effort
    try {
      const turnoFull = await prisma.turno.findUnique({
        where: { id: result.newTurno.id },
        include: { paciente: true }
      });
      if (turnoFull && turnoFull.paciente) {
        await sendConfirmationEmail({
          to: turnoFull.paciente.email,
          turno: turnoFull,
          paciente: turnoFull.paciente,
          pdfUrl: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/turnos/pdf?codigo=${turnoFull.codigo}`
        });
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
