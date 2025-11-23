"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Eye } from "lucide-react";

export default function MisionVision() {
  return (
    <section className="relative py-24">

      {/* 🎨 FONDO FULL WIDTH REAL */}
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-[100vw] bg-[#f8fbfd] -z-10" />

      <div className="max-w-6xl mx-auto px-6">

        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-4">
            Nuestra identidad institucional
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Clínica San Rafael, institución con trayectoria sólida dentro del sistema de salud de Salta,
            comprometida con una atención médica integral, segura y profundamente humana.
          </p>
        </motion.div>

        {/* BLOQUES */}
        <div className="grid md:grid-cols-2 gap-14">

          {/* MISIÓN */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-2xl p-10 shadow-lg border overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-1.5 bg-[#4bbde3]" />

            <div className="flex items-center gap-3 mb-6">
              <HeartHandshake className="w-7 h-7 text-[#4bbde3]" />
              <h3 className="text-xl font-semibold text-slate-800">Misión</h3>
            </div>

            <p className="text-slate-600 leading-relaxed text-sm">
              En la Clínica San Rafael trabajamos para ser referentes en la atención personalizada,
              ofreciendo un servicio de salud donde la calidad y la calidez humana constituyen nuestro
              principal elemento diferenciador.
              <br /><br />
              Nos comprometemos a brindar una experiencia de atención integral, basada en el respeto,
              la empatía y la escucha activa, acompañando a cada paciente en todas las etapas de su
              proceso de atención.
              <br /><br />
              Nuestro equipo interdisciplinario, altamente capacitado, se orienta a garantizar
              diagnósticos precisos, tratamientos seguros y un entorno cuidado, donde cada persona se
              sienta contenida y confiada.
              <br /><br />
              Nuestra misión es mejorar la calidad de vida de la comunidad, promoviendo un acceso
              responsable, seguro y humanizado a los servicios de salud.
            </p>

            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-[#4bbde3]/10 rounded-full blur-3xl" />
          </motion.div>

          {/* VISIÓN */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-white rounded-2xl p-10 shadow-lg border overflow-hidden"
          >
            <div className="absolute left-0 top-0 h-full w-1.5 bg-[#4bbde3]" />

            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-7 h-7 text-[#4bbde3]" />
              <h3 className="text-xl font-semibold text-slate-800">Visión</h3>
            </div>

            <p className="text-slate-600 leading-relaxed text-sm">
              Aspiramos a ser reconocidos como una clínica de referencia en el mercado de la salud
              salteña, consolidándonos como una institución confiable, moderna y comprometida con la
              mejora continua.
              <br /><br />
              Buscamos fortalecer nuestra presencia a través de la excelencia médica, la innovación
              tecnológica y la incorporación permanente de buenas prácticas que optimicen la
              experiencia del paciente.
              <br /><br />
              Visualizamos un crecimiento sostenible que nos permita ampliar nuestros servicios,
              mejorar nuestras instalaciones y continuar formando un equipo profesional de alto nivel.
              <br /><br />
              Queremos posicionarnos como una opción líder en la provincia, destacándonos por brindar
              una atención humana, cercana y eficiente, alineada con las necesidades actuales y futuras
              de la comunidad.
            </p>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4bbde3]/10 rounded-full blur-3xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
