import { prisma } from "../db/prisma";

export async function getTurnosAdmin(params: {
  clinicId: string;
  page?: number;
  limit?: number;
  filters?: {
    fechaFrom?: string;
    fechaTo?: string;
    profesionalId?: string;
    pacienteDni?: string;
    estado?: string;
  };
}) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 20;
  const skip = (page - 1) * limit;

  const where: any = { clinicId: params.clinicId };

  if (params.filters) {
    const f = params.filters;
    if (f.profesionalId) where.profesionalId = f.profesionalId;
    if (f.estado) where.estado = f.estado;
    if (f.pacienteDni) where.paciente = { dni: f.pacienteDni };
    if (f.fechaFrom || f.fechaTo) {
      where.fecha = {};
      if (f.fechaFrom) where.fecha.gte = new Date(f.fechaFrom);
      if (f.fechaTo) where.fecha.lte = new Date(f.fechaTo);
    }
  }

  const [total, data] = await Promise.all([
    prisma.turno.count({ where }),
    prisma.turno.findMany({
      where,
      include: {
        paciente: { select: { nombre: true, apellido: true, dni: true, email: true } },
        profesional: { select: { nombre: true, matricula: true } },
        especialidad: { select: { nombre: true } }
      },
      orderBy: { fecha: "desc" },
      skip,
      take: limit
    })
  ]);

  return { data, total, page, limit };
}

export async function getTurnoByCodigo(codigo: string, clinicId?: string) {
  const where: any = { codigo };
  if (clinicId) where.clinicId = clinicId;
  const turno = await prisma.turno.findUnique({
    where,
    include: {
      paciente: true,
      profesional: true,
      especialidad: true,
      clinic: true
    }
  });
  return turno;
}

export async function getAgenda(profesionalId: string, dateISO: string, clinicId: string) {
  // Compute available slots based on Horario and existing bookings
  // For simplicity, return booked slots and horarios raw
  const fecha = new Date(dateISO);
  const startOfDay = new Date(fecha);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(fecha);
  endOfDay.setHours(23, 59, 59, 999);

  const horarios = await prisma.horario.findMany({
    where: { profesionalId, clinicId }
  });

  const turnos = await prisma.turno.findMany({
    where: {
      profesionalId,
      clinicId,
      fecha: { gte: startOfDay, lte: endOfDay }
    },
    include: { paciente: true, especialidad: true }
  });

  return { horarios, turnos };
}
