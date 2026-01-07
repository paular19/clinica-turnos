import Link from "next/link";
import { crearTurno } from "@/lib/actions/serverTurnos";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Mapeo de días ISO (1=Lun, 7=Dom)
function isoDow(date: Date) {
  const d = date.getDay(); // 0..6 (Dom..Sáb)
  return d === 0 ? 7 : d; // 1..7 (Lun..Dom)
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
    const dni = ((formData.get("dni") as string) || "").trim();
    const obraSocialId = ((formData.get("obraSocialId") as string) || "").trim();
    const especialidadId = ((formData.get("especialidadId") as string) || "").trim();
    const profesionalId = ((formData.get("profesionalId") as string) || "").trim();
    const fechaHoraISO = ((formData.get("fechaHora") as string) || "").trim();

    if (dni.length < 6) throw new Error("DNI inválido (mínimo 6 dígitos).");
    if (!profesionalId || !especialidadId || !obraSocialId || !fechaHoraISO) {
      throw new Error("Faltan datos requeridos. Volvé a comenzar el proceso.");
    }

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
        email,
        telefono: "",
        obraSocialId: obraSocialId || undefined,
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
  const dni = ((Array.isArray(sp.dni) ? sp.dni[0] : sp.dni) || "").toString().trim();
  const obraSocialId = ((Array.isArray(sp.obraSocialId) ? sp.obraSocialId[0] : sp.obraSocialId) || "").toString().trim();
  const especialidadId = ((Array.isArray(sp.especialidadId) ? sp.especialidadId[0] : sp.especialidadId) || "").toString().trim();
  const profesionalId = ((Array.isArray(sp.profesionalId) ? sp.profesionalId[0] : sp.profesionalId) || "").toString().trim();

  if (!nombre || !email || !dni || !obraSocialId || !especialidadId || !profesionalId) {
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

  // ✅ Horarios del profesional (con clinicId verdadero)
  const horarios = await prisma.horario.findMany({
    where: { clinicId, profesionalId },
    orderBy: { diaSemana: "asc" },
  });

  // Generar próximos 14 días de slots disponibles
  const slots: Array<{ fecha: Date; fechaISO: string; dia: string; hora: string }> = [];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const fechaBase = new Date(hoy);
    fechaBase.setDate(hoy.getDate() + i);

    const diaSemana = isoDow(fechaBase); // 1..7

    const horariosDelDia = horarios.filter((h) => h.diaSemana === diaSemana);

    for (const horario of horariosDelDia) {
      const [horaInicio, minInicio] = horario.horaInicio.split(":").map(Number);
      const [horaFin, minFin] = horario.horaFin.split(":").map(Number);
      const intervalo = horario.intervaloMin || 60;

      let minutoActual = horaInicio * 60 + minInicio;
      const minutoFin = horaFin * 60 + minFin;

      while (minutoActual < minutoFin) {
        const hh = Math.floor(minutoActual / 60);
        const mm = minutoActual % 60;

        const fechaSlot = new Date(fechaBase);
        fechaSlot.setHours(hh, mm, 0, 0);

        if (fechaSlot > new Date()) {
          const diaStr = new Intl.DateTimeFormat("es-AR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }).format(fechaSlot);

          const horaStr = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

          slots.push({
            fecha: fechaSlot,
            fechaISO: fechaSlot.toISOString(),
            dia: diaStr,
            hora: horaStr,
          });
        }

        minutoActual += intervalo;
      }
    }
  }

  // Turnos ya ocupados
  const turnosExistentes = await prisma.turno.findMany({
    where: {
      profesionalId,
      clinicId,
      estado: { not: "CANCELADO" },
      fecha: { in: slots.map((s) => s.fecha) },
    },
    select: { fecha: true },
  });

  const fechasOcupadas = new Set(turnosExistentes.map((t) => t.fecha.toISOString()));
  const slotsDisponibles = slots.filter((s) => !fechasOcupadas.has(s.fechaISO));

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
          <strong>Email:</strong> {email}
          <br />
          <strong>DNI:</strong> {dni}
        </p>

        {slotsDisponibles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              No hay turnos disponibles en los próximos 14 días para este profesional.
            </p>
            <Link
              href={`/turnos/solicitar/profesionales?nombre=${encodeURIComponent(
                nombre
              )}&email=${encodeURIComponent(email)}&dni=${encodeURIComponent(
                dni
              )}&obraSocialId=${encodeURIComponent(
                obraSocialId
              )}&especialidadId=${encodeURIComponent(especialidadId)}`}
              className="text-[#4bbde3] hover:underline"
            >
              Elegir otro profesional
            </Link>
          </div>
        ) : (
          <form action={handleSubmitTurno} className="space-y-4">
            <input type="hidden" name="nombre" value={nombre} />
            <input type="hidden" name="email" value={email} />
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
