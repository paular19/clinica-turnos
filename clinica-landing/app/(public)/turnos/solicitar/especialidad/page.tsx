import { listEspecialidadesPorObraSocial } from "@/lib/actions/turnos-queries";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
interface Props {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function handleSelect(formData: FormData) {
  "use server";

  const nombre = (formData.get("nombre") || "").toString();
  const email = (formData.get("email") || "").toString();
  const dni = (formData.get("dni") || "").toString();
  const obraSocialId = (formData.get("obraSocialId") || "").toString();
  const especialidadId = (formData.get("especialidadId") || "").toString();

  if (!nombre || !email || !dni || !obraSocialId || !especialidadId) {
    return { success: false, message: "Datos incompletos" };
  }

  const params = new URLSearchParams({
    nombre,
    email,
    dni,
    obraSocialId,
    especialidadId,
  });

  redirect(`/turnos/solicitar/profesionales?${params.toString()}`);
}

export default async function EspecialidadPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};

  const nombre = Array.isArray(sp.nombre) ? sp.nombre[0] : sp.nombre || "";
  const email = Array.isArray(sp.email) ? sp.email[0] : sp.email || "";
  const dni = Array.isArray(sp.dni) ? sp.dni[0] : sp.dni || "";
  const obraSocialId = Array.isArray(sp.obraSocialId)
    ? sp.obraSocialId[0]
    : sp.obraSocialId || "";

  if (!nombre || !email || !dni || !obraSocialId) return notFound();

  const especialidades = await listEspecialidadesPorObraSocial(obraSocialId);

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] p-6 pt-20">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">
            Elegí especialidad
          </h1>
          <Link
            href="/turnos"
            className="text-sm text-slate-600 hover:underline"
          >
            Volver
          </Link>
        </div>

        <form action={handleSelect} className="space-y-4">
          <input type="hidden" name="nombre" value={nombre} />
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="dni" value={dni} />
          <input type="hidden" name="obraSocialId" value={obraSocialId} />

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Especialidad
            </label>
            <select
              name="especialidadId"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 p-3 bg-white"
            >
              <option value="">Seleccioná</option>
              {especialidades.map((e: any) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold bg-[var(--brand-500)] hover:bg-[var(--brand-600)] transition"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
