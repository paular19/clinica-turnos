import { listObrasSociales } from "@/lib/actions/turnos-queries";
import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Paso 1: Formulario inicial de solicitud de turno
 * Recoge datos del paciente y obra social
 */
async function handleSubmit(formData: FormData) {
  "use server";

  const nombre = (formData.get("nombre") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const dni = (formData.get("dni") || "").toString().trim();
  const obraSocialId = (formData.get("obraSocialId") || "").toString();

  if (!nombre || !email || !dni || !obraSocialId) {
    return { success: false, message: "Todos los campos son requeridos" };
  }

  const params = new URLSearchParams({
    nombre,
    email,
    dni,
    obraSocialId,
  });

  redirect(`/turnos/solicitar/especialidad?${params.toString()}`);
}

export default async function SolicitarTurnoPage() {
  const obrasSociales = await listObrasSociales();

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6 pt-20">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">
            Solicitud de Turno
          </h1>
          <Link
            href="/turnos"
            className="text-sm text-slate-600 hover:underline"
          >
            Volver
          </Link>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Por favor completá tus datos para continuar con la solicitud
        </p>

        <form action={handleSubmit} className="space-y-5">
          {/* Nombre completo */}
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Nombre completo
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4bbde3] focus:border-transparent outline-none transition"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4bbde3] focus:border-transparent outline-none transition"
              placeholder="tu@email.com"
            />
          </div>

          {/* DNI */}
          <div>
            <label
              htmlFor="dni"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              DNI (sin puntos)
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              required
              pattern="[0-9]{6,8}"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4bbde3] focus:border-transparent outline-none transition"
              placeholder="12345678"
            />
          </div>

          {/* Obra Social */}
          <div>
            <label
              htmlFor="obraSocialId"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Obra Social
            </label>
            <select
              id="obraSocialId"
              name="obraSocialId"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4bbde3] focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Seleccioná tu obra social</option>
              {obrasSociales.map((os: any) => (
                <option key={os.id} value={os.id}>
                  {os.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón continuar */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl text-white text-lg font-semibold tracking-wide bg-gradient-to-r from-[#4bbde3] to-[#2b8fb8] shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}
