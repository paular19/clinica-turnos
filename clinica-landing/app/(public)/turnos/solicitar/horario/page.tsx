import Link from "next/link";
import { crearTurno } from "@/lib/actions/serverTurnos";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db/prisma";
import { getDisponibilidadProfesional } from "@/lib/queries/turnos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SLOT_WINDOW_DAYS = 30;

function toISODateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODateOrNull(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Paso 4: Selección de fecha y hora
 */
async function handleSubmitTurno(formData: FormData) {
  "use server";

  const prisma = getPrisma();

  try {
    const nombre = ((formData.get("nombre") as string) || "").trim();
    const email = ((formData.get("email") as string) || "").trim();
    const telefono = ((formData.get("telefono") as string) || "").trim();
    const dni = ((formData.get("dni") as string) || "").trim();
    const obraSocialId = ((formData.get("obraSocialId") as string) || "").trim();
    const especialidadId = ((formData.get("especialidadId") as string) || "").trim();
    const profesionalId = ((formData.get("profesionalId") as string) || "").trim();
    const fechaHoraISO = ((formData.get("fechaHora") as string) || "").trim();

    if (dni.length < 6) throw new Error("DNI inválido (mínimo 6 dígitos).");
    if (!telefono || !profesionalId || !especialidadId || !obraSocialId || !fechaHoraISO) {
      throw new Error("Faltan datos requeridos. Volvé a comenzar el proceso.");
    }
    if (email && !email.includes("@")) throw new Error("Email inválido.");

    // Validar fecha ISO
    const fechaDate = new Date(fechaHoraISO);
    if (Number.isNaN(fechaDate.getTime())) throw new Error("Fecha/Hora inválida.");

    // ✅ Fuente de verdad: clinicId del profesional
    const profesional = await prisma.profesional.findUnique({
      where: { id: profesionalId },
      select: { id: true, clinicId: true },
    });
    if (!profesional) throw new Error("Profesional no encontrado.");

    // Separar nombre y apellido
    const partes = nombre.split(" ").filter(Boolean);
    const primerNombre = partes[0] ?? "";
    const apellido = partes.slice(1).join(" ") || primerNombre;

    const turnoData = {
      clinicId: profesional.clinicId,
      profesionalId,
      especialidadId,
      fecha: fechaDate.toISOString(), // ✅ string como espera crearTurno()
      motivo: "Solicitud web desde landing",
      paciente: {
        nombre: primerNombre,
        apellido,
        dni,
        email: email || undefined,
        telefono,
        obraSocialId: obraSocialId && obraSocialId.length > 0 ? obraSocialId : undefined,
      },
    };

    const result = await crearTurno(turnoData);
    redirect(`/turnos/confirmacion?codigo=${result.codigo}`);
  } catch (error) {
    console.error("Error creando turno:", error);
    throw error;
  }
}

export default async function HorarioPage({ searchParams }: Props) {
  const prisma = getPrisma();
  const sp = (await searchParams) ?? {};

  const nombre = ((Array.isArray(sp.nombre) ? sp.nombre[0] : sp.nombre) || "").toString().trim();
  const email = ((Array.isArray(sp.email) ? sp.email[0] : sp.email) || "").toString().trim();
  const telefono = ((Array.isArray(sp.telefono) ? sp.telefono[0] : sp.telefono) || "").toString().trim();
  const dni = ((Array.isArray(sp.dni) ? sp.dni[0] : sp.dni) || "").toString().trim();
  const obraSocialId = ((Array.isArray(sp.obraSocialId) ? sp.obraSocialId[0] : sp.obraSocialId) || "").toString().trim();
  const especialidadId = ((Array.isArray(sp.especialidadId) ? sp.especialidadId[0] : sp.especialidadId) || "").toString().trim();
  const profesionalId = ((Array.isArray(sp.profesionalId) ? sp.profesionalId[0] : sp.profesionalId) || "").toString().trim();
  const desdeParam = ((Array.isArray(sp.desde) ? sp.desde[0] : sp.desde) || "").toString().trim();

  if (!nombre || !telefono || !dni || !obraSocialId || !especialidadId || !profesionalId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Parámetros incompletos</h2>
          <p className="text-slate-600 mb-4">Volvé al inicio del flujo.</p>
          <Link href="/turnos" className="text-[var(--brand-500)] hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Buscar profesional para obtener clinicId real
  const profesional = await prisma.profesional.findUnique({
    where: { id: profesionalId },
    select: { id: true, clinicId: true },
  });

  if (!profesional) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Profesional no encontrado</h2>
          <Link href="/turnos" className="text-[#4bbde3] hover:underline">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  const clinicId = profesional.clinicId;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaDesdeParam = parseISODateOrNull(desdeParam);
  const fechaInicio = fechaDesdeParam && fechaDesdeParam >= hoy ? fechaDesdeParam : new Date(hoy);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaInicio.getDate() + SLOT_WINDOW_DAYS - 1);

  const queryBase = {
    nombre,
    telefono,
    dni,
    obraSocialId,
    especialidadId,
    profesionalId,
  };

  const buildHorarioHref = (desde: Date) => {
    const params = new URLSearchParams({ ...queryBase, desde: toISODateLocal(desde) });
    if (email) params.set("email", email);
    return `/turnos/solicitar/horario?${params.toString()}`;
  };

  const buildProfesionalesHref = () => {
    const params = new URLSearchParams({ nombre, telefono, dni, obraSocialId, especialidadId });
    if (email) params.set("email", email);
    return `/turnos/solicitar/profesionales?${params.toString()}`;
  };

  const fechaAnteriorInicio = new Date(fechaInicio);
  fechaAnteriorInicio.setDate(fechaInicio.getDate() - SLOT_WINDOW_DAYS);
  const puedeIrRangoAnterior = fechaAnteriorInicio >= hoy;

  const fechaSiguienteInicio = new Date(fechaInicio);
  fechaSiguienteInicio.setDate(fechaInicio.getDate() + SLOT_WINDOW_DAYS);

  const formatearRango = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Generar slots disponibles en ventana navegable (sin límite hacia adelante)
  const slotsDisponibles: Array<{ fechaISO: string; dia: string; hora: string }> = [];

  const fechasVentana = Array.from({ length: SLOT_WINDOW_DAYS }, (_, i) => {
    const fechaBase = new Date(fechaInicio);
    fechaBase.setDate(fechaInicio.getDate() + i);
    return fechaBase;
  });

  const disponibilidadPorDia = await Promise.all(
    fechasVentana.map(async (fechaBase) => {
      const fechaBaseISO = toISODateLocal(fechaBase);
      const horasDisponibles = await getDisponibilidadProfesional({
        clinicId,
        profesionalId,
        dateISO: fechaBaseISO,
      });

      return { fechaBaseISO, horasDisponibles };
    })
  );

  for (const { fechaBaseISO, horasDisponibles } of disponibilidadPorDia) {

    for (const hora of horasDisponibles) {
      const fechaSlot = new Date(`${fechaBaseISO}T${hora}:00-03:00`);
      if (fechaSlot <= new Date()) continue;

      const dia = new Intl.DateTimeFormat("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(fechaSlot);

      slotsDisponibles.push({
        fechaISO: fechaSlot.toISOString(),
        dia,
        hora,
      });
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6 pt-20">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Elegí fecha y hora</h1>
          <Link href="/turnos" className="text-sm text-slate-600 hover:underline">
            Volver
          </Link>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          <strong>Paciente:</strong> {nombre}
          <br />
          <strong>Telefono:</strong> {telefono}
          {email ? (
            <>
              <br />
              <strong>Email:</strong> {email}
            </>
          ) : null}
          <br />
          <strong>DNI:</strong> {dni}
        </p>

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm text-slate-700 mb-3">
            Mostrando disponibilidad del {formatearRango.format(fechaInicio)} al {formatearRango.format(fechaFin)}.
          </p>
          <div className="flex flex-wrap gap-2">
            {puedeIrRangoAnterior && (
              <Link
                href={buildHorarioHref(fechaAnteriorInicio)}
                className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
              >
                Ver 30 días anteriores
              </Link>
            )}
            <Link
              href={buildHorarioHref(fechaSiguienteInicio)}
              className="px-3 py-2 text-sm rounded-lg border border-[#4bbde3] text-[#2b8fb8] hover:bg-[#f0f9fc]"
            >
              Ver próximos 30 días
            </Link>
          </div>
        </div>

        {slotsDisponibles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              No hay turnos disponibles para este profesional en el rango seleccionado.
            </p>
            <Link
              href={buildProfesionalesHref()}
              className="text-[#4bbde3] hover:underline"
            >
              Elegir otro profesional
            </Link>
          </div>
        ) : (
          <form action={handleSubmitTurno} className="space-y-4">
            <input type="hidden" name="nombre" value={nombre} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="telefono" value={telefono} />
            <input type="hidden" name="dni" value={dni} />
            <input type="hidden" name="obraSocialId" value={obraSocialId} />
            <input type="hidden" name="especialidadId" value={especialidadId} />
            <input type="hidden" name="profesionalId" value={profesionalId} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Seleccioná un horario disponible:
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                {slotsDisponibles.map((slot) => (
                  <label key={slot.fechaISO} className="relative cursor-pointer">
                    <input type="radio" name="fechaHora" value={slot.fechaISO} required className="peer sr-only" />
                    <div className="border-2 border-slate-200 rounded-lg p-3 text-center transition-all hover:border-[#4bbde3] hover:bg-[#f0f9fc] peer-checked:border-[#4bbde3] peer-checked:bg-[#4bbde3] peer-checked:text-white">
                      <div className="text-xs font-medium capitalize">{slot.dia}</div>
                      <div className="text-lg font-bold mt-1">{slot.hora}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-xl text-white text-lg font-semibold tracking-wide bg-gradient-to-r from-[#4bbde3] to-[#2b8fb8] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Confirmar turno
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
