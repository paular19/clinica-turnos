"use server";

import { prisma } from "../db/prisma";
import { crearProfesionalSchema, crearEspecialidadSchema, registrarPacienteSchema } from "../zod/schemas";
import { Rol } from "@prisma/client";
import { z } from "zod";
import { sanitizeString } from "../utils/sanitize";

export async function crearProfesional(input: any) {
  try {
    const parsed = crearProfesionalSchema.parse(input);
    const nombre = sanitizeString(parsed.nombre);

    // Crear usuario si existe clerkId
    let usuarioId: string | undefined;
    if (parsed.clerkId) {
      const usuario = await prisma.usuario.create({
        data: {
          clerkId: parsed.clerkId,
          nombre,
          email: `${parsed.clerkId}@example.com`,
          rol: Rol.MEDICO,
          clinicId: parsed.clinicId
        }
      });
      usuarioId = usuario.id;
    }

    // Crear profesional
    const profesional = await prisma.profesional.create({
      data: {
        nombre,
        matricula: parsed.matricula,
        fotoUrl: parsed.fotoUrl || undefined,
        clinicId: parsed.clinicId,
        usuarioId,
        horarios: {
          create: parsed.horarios?.map((h: any) => ({
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            intervaloMin: h.intervaloMin,
            clinicId: parsed.clinicId
          })) || []
        }
      }
    });

    if (parsed.especialidadIds && parsed.especialidadIds.length > 0) {
      for (const eid of parsed.especialidadIds) {
        await prisma.$executeRaw`INSERT INTO _ProfesionalToEspecialidad (A, B) VALUES (${profesional.id}, ${eid}) ON CONFLICT DO NOTHING;`;
      }
    }

    return { profesionalId: profesional.id };
  } catch (err) {
    if (err instanceof z.ZodError) throw err;
    console.error(err);
    throw new Error("Error creating profesional");
  }
}

export async function crearEspecialidad(input: any) {
  try {
    const parsed = crearEspecialidadSchema.parse(input);
    const especialidad = await prisma.especialidad.create({
      data: {
        nombre: sanitizeString(parsed.nombre),
        descripcion: parsed.descripcion,
        clinicId: parsed.clinicId
      }
    });
    return { id: especialidad.id };
  } catch (err) {
    if (err instanceof z.ZodError) throw err;
    if ((err as any).code === "P2002") {
      throw new Error("Especialidad with that name already exists for clinic");
    }
    console.error(err);
    throw new Error("Error creating especialidad");
  }
}

export async function registrarPaciente(input: any) {
  try {
    const parsed = registrarPacienteSchema.parse(input);
    const paciente = await prisma.paciente.upsert({
      where: { dni_clinicId: { dni: parsed.dni, clinicId: parsed.clinicId } },
      update: {
        nombre: sanitizeString(parsed.nombre),
        apellido: sanitizeString(parsed.apellido),
        email: parsed.email,
        telefono: parsed.telefono || undefined,
        obraSocialId: parsed.obraSocialId || undefined
      },
      create: {
        nombre: sanitizeString(parsed.nombre),
        apellido: sanitizeString(parsed.apellido),
        dni: parsed.dni,
        email: parsed.email,
        telefono: parsed.telefono || undefined,
        obraSocialId: parsed.obraSocialId || undefined,
        clinicId: parsed.clinicId
      }
    });

    return { pacienteId: paciente.id };
  } catch (err) {
    if (err instanceof z.ZodError) throw err;
    console.error(err);
    throw new Error("Error registering paciente");
  }
}
