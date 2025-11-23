"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function QuienesSomos() {
  const fotos = [
    { src: "/assets/foto1.JPG", size: 220, top: "5%", left: "10%", rot: -6 },
    { src: "/assets/foto2.jpeg", size: 220, top: "45%", left: "5%", rot: 4 },
    { src: "/assets/foto3.jpeg", size: 220, top: "25%", left: "50%", rot: 2 },
    { src: "/assets/foto4.JPG", size: 220, top: "65%", left: "60%", rot: -8 },
  ];

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
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative">

        {/* COLLAGE DE FOTOS (hidden en móviles) */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative w-full min-h-[650px] md:min-h-[700px] hidden md:block"
        >
          {fotos.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true }}
              className="absolute"
              style={{ top: f.top, left: f.left, rotate: `${f.rot}deg` }}
            >
              <div
                className="absolute inset-0 -z-10 rounded-full bg-[#4bbde3]/20 blur-2xl"
                style={{ width: f.size + 30, height: f.size + 30 }}
              />

              <Image
                src={f.src}
                alt=""
                width={f.size}
                height={f.size}
                className="rounded-full object-cover shadow-2xl border-[6px] border-white"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* VERSIÓN MÓVIL: 2x2 con fotos redondas, borde y sombra (mantener estilo desktop) */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {fotos.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              viewport={{ once: true }}
              className="relative h-36 flex items-center justify-center"
            >
              <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden shadow-2xl border-[6px] border-white">
                <Image
                  src={f.src}
                  alt=""
                  fill
                  sizes="50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* TEXTO */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
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
      </div>
    </section>
  );
}
