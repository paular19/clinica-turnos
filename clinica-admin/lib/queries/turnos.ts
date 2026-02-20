import { prisma } from "../db/prisma";
import { Prisma, TurnoEstado } from "@prisma/client";

type TurnosAdminParams = {
  clinicId: string;
  page?: number;
  limit?: number;
  filters?: {
    fechaFrom?: string;
    fechaTo?: string;
    profesionalId?: string;
    pacienteDni?: string;
    estado?: TurnoEstado; // 👈 clave: ya no es string
  };
};

export async function getTurnosAdmin(params: TurnosAdminParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;

  const f = params.filters;

  const where: Prisma.TurnoWhereInput = {
    clinicId: params.clinicId,

    ...(f?.profesionalId ? { profesionalId: f.profesionalId } : {}),
    ...(f?.estado ? { estado: f.estado } : {}),
    ...(f?.pacienteDni ? { paciente: { dni: f.pacienteDni } } : {}),

    ...(f?.fechaFrom || f?.fechaTo
      ? {
        fecha: {
          ...(f?.fechaFrom ? { gte: new Date(f.fechaFrom) } : {}),
          ...(f?.fechaTo ? { lte: new Date(f.fechaTo) } : {}),
        },
      }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.turno.count({ where }),
    prisma.turno.findMany({
      where,
      include: {
        paciente: { select: { nombre: true, apellido: true, dni: true, email: true } },
        profesional: { select: { nombre: true, matricula: true } },
        especialidad: { select: { nombre: true } },
      },
      orderBy: { fecha: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return { data, total, page, limit };
}

export async function getTurnoByCodigo(codigo: string, clinicId?: string) {
  // Si querés filtrar por clinicId, usá findFirst
  if (clinicId) {
    return prisma.turno.findFirst({
      where: { codigo, clinicId },
      include: { paciente: true, profesional: true, especialidad: true, clinic: true },
    });
  }

  return prisma.turno.findUnique({
    where: { codigo },
    include: { paciente: true, profesional: true, especialidad: true, clinic: true },
  });
}

/* Disponibilidad (slots libres por día) */
function isoDow(date: Date) {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}
function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function fromMinutes(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

const CLINIC_TZ = "America/Argentina/Buenos_Aires";

function toClinicHHMM(date: Date) {
  const parts = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: CLINIC_TZ,
  }).formatToParts(date);

  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hh}:${mm}`;
}

export async function getDisponibilidadProfesional(params: {
  clinicId: string;
  profesionalId: string;
  dateISO: string; // "YYYY-MM-DD"
}) {
  const { clinicId, profesionalId, dateISO } = params;

  const day = new Date(`${dateISO}T00:00:00`);
  const diaSemana = isoDow(day);

  // Verificar si el día está bloqueado
  const diaBloqueado = await prisma.diaBloqueado.findUnique({
    where: {
      fecha_profesionalId_clinicId: {
        fecha: day,
        profesionalId,
        clinicId,
      },
    },
  });

  if (diaBloqueado) return []; // Día bloqueado, sin horarios disponibles

  const horarios = await prisma.horario.findMany({
    where: { clinicId, profesionalId, diaSemana },
    select: { horaInicio: true, horaFin: true, intervaloMin: true },
    orderBy: { horaInicio: "asc" },
  });

  if (horarios.length === 0) return [];

  const start = new Date(`${dateISO}T00:00:00-03:00`);
  const end = new Date(`${dateISO}T23:59:59.999-03:00`);

  const turnos: Array<{ fecha: Date }> = await prisma.turno.findMany({
    where: {
      clinicId,
      profesionalId,
      fecha: { gte: start, lte: end },
      NOT: { estado: "CANCELADO" },
    },
    select: { fecha: true },
  });

  const ocupados = new Set(
    turnos.map((t) => toClinicHHMM(t.fecha))
  );

  const slots: string[] = [];

  for (const h of horarios) {
    const startMin = toMinutes(h.horaInicio);
    const endMin = toMinutes(h.horaFin);
    const step = h.intervaloMin || 45;

    for (let m = startMin; m + step <= endMin; m += step) {
      const hhmm = fromMinutes(m);
      if (!ocupados.has(hhmm)) slots.push(hhmm);
    }
  }

  return slots;
}
export async function getTurnosMedicoHoy(profesionalId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId,
      fecha: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      paciente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          dni: true,
          email: true,
          telefono: true,
          obraSocial: {
            select: { nombre: true },
          },
        },
      },
      profesional: {
        select: {
          id: true,
          nombre: true,
          matricula: true,
        },
      },
      especialidad: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: {
      fecha: "asc",
    },
  });

  return turnos;
}

export async function getTurnosMedicoResumen(profesionalId: string) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId,
      fecha: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      estado: true,
    },
  });

  const resumen = {
    total: turnos.length,
    confirmados: turnos.filter((t) => t.estado === "CONFIRMADO").length,
    asistidos: turnos.filter((t) => t.estado === "ASISTIDO").length,
    retrasados: turnos.filter((t) => t.estado === "RETRASADO").length,
    cancelados: turnos.filter((t) => t.estado === "CANCELADO").length,
    pendientes: turnos.filter((t) => t.estado === "PENDIENTE").length,
  };

  return resumen;
}