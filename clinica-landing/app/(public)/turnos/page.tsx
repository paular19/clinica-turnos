"use client";

import Image from "next/image";

export default function TurnosPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#eaf6fb] via-white to-[#f2f9fc] overflow-hidden">

      {/* Decoración suave */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-[#4bbde3]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-120px] w-96 h-96 bg-[#4bbde3]/10 rounded-full blur-3xl" />

      {/* Card principal */}
      <div className="relative w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/70">

        {/* Logo */}
        <div className="pt-10 pb-6 flex justify-center">
          <Image
            src="/assets/logo-clinica.png"
            alt="Clínica San Rafael"
            width={220}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Botones */}
        <div className="px-10 pb-8 space-y-6">

          <button
            className="w-full py-6 rounded-xl text-white text-lg font-semibold tracking-wide
                       bg-gradient-to-r from-[#4bbde3] to-[#2b8fb8] shadow-lg hover:shadow-xl transition"
          >
            MIS TURNOS
          </button>

          <button
            className="w-full py-6 rounded-xl text-white text-lg font-semibold tracking-wide
                       bg-gradient-to-r from-[#5ec8ec] to-[#3da3c7] shadow-lg hover:shadow-xl transition"
          >
            SOLICITUD DE TURNO
          </button>

        </div>

      </div>
    </div>
  );
}
