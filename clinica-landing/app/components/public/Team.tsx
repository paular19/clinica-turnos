"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function QuienesSomos() {
  return (
    <section className="relative w-full py-28 overflow-visible">

      {/* ⭐ FONDO FULL WIDTH CON ONDAS - SIN CORTARSE */}
      {/* 🌊 ONDA FULL WIDTH */}
      {/* 🌊 ONDA FULL WIDTH CORRECTA */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] -z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="block w-full h-[260px] text-[#4bbde3] opacity-[0.25]"
        >
          <path
            fill="currentColor"
            d="M0,160L40,149.3C80,139,160,117,240,138.7C320,160,400,224,480,256C560,288,640,288,720,266.7C800,245,880,203,960,176C1040,149,1120,139,1200,133.3C1280,128,1360,128,1400,128L1440,128L1440,0L0,0Z"
          />
        </svg>
      </div>



      {/* ⭐ CONTENIDO CENTRADO */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* TEXTO - IZQUIERDA */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6 text-slate-700 leading-relaxed"
          >
            <h2 className="text-3xl font-semibold text-slate-800 mb-4">
              ¿Quiénes somos?
            </h2>

            <p>
              La <strong>Clínica San Rafael</strong> cuenta con más de cuatro décadas de trayectoria en Salta,
              brindando atención médica cercana, segura y personalizada.
            </p>

            <p>
              La gestión está a cargo del <strong>Dr. Sabio</strong>, médico con formación en medicina general,
              clínica médica y medicina asistencial.
            </p>

            <p>
              Nos destacamos por la calidad humana, el profesionalismo y la dedicación de nuestro equipo.
            </p>
          </motion.div>

          {/* FOTOS SUPERPUESTAS - DERECHA */}
          <div className="relative hidden md:block min-h-[800px]">
            {/* Foto 1 - Más a la derecha */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="absolute top-32 right-0 rounded-3xl overflow-hidden shadow-2xl max-w-[300px]"
            >
              <Image
                src="/assets/fotonos1.jpg"
                alt="Clínica San Rafael"
                width={300}
                height={400}
                className="w-full h-auto object-cover"
                sizes="300px"
              />
            </motion.div>

            {/* Foto 4 - Más a la izquierda y superpuesta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute top-72 left-0 rounded-3xl overflow-hidden shadow-2xl max-w-[300px] z-10"
            >
              <Image
                src="/assets/fotonos4.jpg"
                alt="Instalaciones Clínica"
                width={300}
                height={400}
                className="w-full h-auto"
                sizes="300px"
              />
            </motion.div>
          </div>

        </div>

        {/* Elementos decorativos */}
        <div className="absolute -top-6 left-20 w-32 h-32 bg-[#4bbde3]/20 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-6 right-20 w-40 h-40 bg-[#d89c6c]/20 rounded-full blur-3xl -z-10" />
      </div>
    </section>
  );
}
