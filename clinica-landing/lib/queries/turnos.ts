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

export async function getDisponibilidadProfesional(params: {
  clinicId: string;
  profesionalId: string;
  dateISO: string; // "YYYY-MM-DD"
}) {
  const { clinicId, profesionalId, dateISO } = params;

  const day = new Date(`${dateISO}T00:00:00`);
  const diaSemana = isoDow(day);

  const horarios = await prisma.horario.findMany({
    where: { clinicId, profesionalId, diaSemana },
    select: { horaInicio: true, horaFin: true, intervaloMin: true },
    orderBy: { horaInicio: "asc" },
  });

  if (horarios.length === 0) return [];

  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(`${dateISO}T23:59:59.999`);

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
    turnos.map((t) => fromMinutes(t.fecha.getHours() * 60 + t.fecha.getMinutes()))
  );

  const slots: string[] = [];

  for (const h of horarios) {
    const startMin = toMinutes(h.horaInicio);
    const endMin = toMinutes(h.horaFin);
    const step = h.intervaloMin || 15;

    for (let m = startMin; m + step <= endMin; m += step) {
      const hhmm = fromMinutes(m);
      if (!ocupados.has(hhmm)) slots.push(hhmm);
    }
  }

  return slots;
}
