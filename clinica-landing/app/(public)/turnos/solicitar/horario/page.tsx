import Link from "next/link";
import { crearTurno } from "@/lib/actions/serverTurnos";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Mapeo de días ISO (1=Lun, 7=Dom) 
function isoDow(date: Date) {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

/**
 * Paso 4: Selección de fecha y hora
 * Recibe todos los datos previos por query params y crea el turno en la DB
 */
async function handleSubmitTurno(formData: FormData) {
  "use server";

  try {
    const nombre = (formData.get("nombre") as string) || "";
    const email = (formData.get("email") as string) || "";
    const dni = (formData.get("dni") as string) || "";
    const obraSocialId = (formData.get("obraSocialId") as string) || "";
    const especialidadId = (formData.get("especialidadId") as string) || "";
    const profesionalId = (formData.get("profesionalId") as string) || "";
    const fechaHora = (formData.get("fechaHora") as string) || ""; // ISO string completo

    console.log("Form data received:", {
      nombre,
      email,
      dni,
      obraSocialId,
      especialidadId,
      profesionalId,
      fechaHora
    });

    const dniTrim = dni.trim();
    if (dniTrim.length < 6) {
      throw new Error("DNI inválido (mínimo 6 dígitos).");
    }

    if (!profesionalId || !especialidadId || !obraSocialId) {
      throw new Error("Faltan datos requeridos. Por favor vuelva a comenzar el proceso.");
    }

    // Obtener clinicId de la primera clínica (default)
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) throw new Error("No clinic found");

    console.log("Clinic ID:", clinic.id);

    // Separar nombre y apellido (asumiendo formato "Nombre Apellido")
    const nombreCompleto = nombre.trim().split(" ").filter(Boolean);
    const primerNombre = nombreCompleto[0] ?? "";
    const apellido = nombreCompleto.slice(1).join(" ") || primerNombre;

    const turnoData = {
      clinicId: clinic.id,
      profesionalId: profesionalId.trim(),
      especialidadId: especialidadId.trim(),
      fecha: fechaHora,
      motivo: "Solicitud web desde landing",
      paciente: {
        nombre: primerNombre,
        apellido,
        dni: dniTrim,
        email,
        telefono: "",
        obraSocialId: obraSocialId.trim() || undefined,
      },
    };

    console.log("Creating turno with data:", turnoData);

    const result = await crearTurno(turnoData);

    redirect(`/turnos/confirmacion?codigo=${result.codigo}`);
  } catch (error: any) {
    console.error("Error creando turno:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
      issues: error?.issues,
    });
    throw error;
  }
}

export default async function HorarioPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};

  const nombre = Array.isArray(sp.nombre) ? sp.nombre[0] : sp.nombre || "";
  const email = Array.isArray(sp.email) ? sp.email[0] : sp.email || "";
  const dni = Array.isArray(sp.dni) ? sp.dni[0] : sp.dni || "";
  const obraSocialId = Array.isArray(sp.obraSocialId)
    ? sp.obraSocialId[0]
    : sp.obraSocialId || "";
  const especialidadId = Array.isArray(sp.especialidadId)
    ? sp.especialidadId[0]
    : sp.especialidadId || "";
  const profesionalId = Array.isArray(sp.profesionalId)
    ? sp.profesionalId[0]
    : sp.profesionalId || "";

  if (
    !nombre ||
    !email ||
    !dni ||
    !obraSocialId ||
    !especialidadId ||
    !profesionalId
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Parámetros incompletos
          </h2>
          <p className="text-slate-600 mb-4">Volvé al inicio del flujo.</p>
          <Link
            href="/turnos"
            className="text-[var(--brand-500)] hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Obtener horarios del profesional
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    return <div>Error: No clinic found</div>;
  }

  const horarios = await prisma.horario.findMany({
    where: {
      clinicId: clinic.id,
      profesionalId,
    },
    orderBy: { diaSemana: "asc" },
  });

  // Generar próximos 14 días de slots disponibles
  const slots: Array<{ fecha: Date; fechaISO: string; dia: string; hora: string }> = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    const diaSemana = isoDow(fecha);

    // Buscar horarios para este día
    const horariosDelDia = horarios.filter((h) => h.diaSemana === diaSemana);

    for (const horario of horariosDelDia) {
      const [horaInicio, minInicio] = horario.horaInicio.split(":").map(Number);
      const [horaFin, minFin] = horario.horaFin.split(":").map(Number);
      const intervalo = horario.intervaloMin || 60;

      let minutoActual = horaInicio * 60 + minInicio;
      const minutoFin = horaFin * 60 + minFin;

      while (minutoActual < minutoFin) {
        const hora = Math.floor(minutoActual / 60);
        const min = minutoActual % 60;

        const fechaSlot = new Date(fecha);
        fechaSlot.setHours(hora, min, 0, 0);

        // Solo agregar si es futuro
        if (fechaSlot > new Date()) {
          const diaStr = new Intl.DateTimeFormat("es-AR", {
            weekday: "short",
            day: "numeric",
            month: "short",
          }).format(fechaSlot);

          const horaStr = `${String(hora).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

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

  // Verificar turnos ya ocupados
  const turnosExistentes = await prisma.turno.findMany({
    where: {
      profesionalId,
      clinicId: clinic.id,
      estado: { not: "CANCELADO" },
      fecha: { in: slots.map((s) => s.fecha) },
    },
    select: { fecha: true },
  });

  const fechasOcupadas = new Set(
    turnosExistentes.map((t) => t.fecha.toISOString())
  );

  const slotsDisponibles = slots.filter((s) => !fechasOcupadas.has(s.fechaISO));

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6 pt-20">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">
            Elegí fecha y hora
          </h1>
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
              href={`/turnos/solicitar/profesionales?nombre=${encodeURIComponent(nombre)}&email=${encodeURIComponent(email)}&dni=${encodeURIComponent(dni)}&obraSocialId=${encodeURIComponent(obraSocialId)}&especialidadId=${encodeURIComponent(especialidadId)}`}
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
                  <label
                    key={slot.fechaISO}
                    className="relative cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="fechaHora"
                      value={slot.fechaISO}
                      required
                      className="peer sr-only"
                    />
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

