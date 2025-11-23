"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroClinicaCompleto() {
  return (
    <section className="relative w-full min-h-[80vh] overflow-hidden bg-white">

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">

        {/* TEXTO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-slate-700 mb-6 leading-tight">
            Atención médica de excelencia
            <br className="hidden md:block" />
            centrada en vos
          </h1>

          <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-xl mx-auto md:mx-0">
            Profesionales especializados, tecnología avanzada y un enfoque humano.
          </p>

          <Link
            href="/turnos"
            className="inline-block bg-[var(--brand-500)] hover:bg-[var(--brand-600)]
            text-white font-semibold px-8 py-4 rounded-xl shadow-md transition"
          >
            Solicitar turno
          </Link>
        </motion.div>

        {/* IMAGEN */}
        <div className="relative w-full h-[280px] sm:h-[360px] md:h-[480px] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/assets/hero-entrada.jpg"
            alt="Equipo médico profesional"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[var(--brand-500)]/15" />
        </div>

      </div>

      {/* 🌊 ONDAS MÁS BAJAS, ALTAS Y SUAVES */}
      {/* 🌊 ONDAS BIEN ABAJO, SUAVES Y ALTAS */}
      <div className="absolute -bottom-52 left-0 w-full pointer-events-none">
        <svg
          viewBox="0 0 1440 400"
          className="w-full h-[360px] rotate-180 opacity-[0.12]"
          preserveAspectRatio="none"
        >
          <path
            fill="#4bbde3"
            d="M0,300L60,285.3C120,271,240,241,360,229.3C480,218,600,224,720,240C840,256,960,282,1080,288C1200,294,1320,282,1380,276L1440,270L1440,400L0,400Z"
          />
        </svg>
      </div>


    </section>
  );
}
