"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const imagenes = [
  { src: "/assets/galeria1.jpeg", alt: "Instalaciones de la clínica" },
  { src: "/assets/galeria2.jpeg", alt: "Sala de espera" },
  { src: "/assets/galeria3.jpeg", alt: "Consultorios médicos" },
  { src: "/assets/galeria4.jpg", alt: "Área de internación" },
  { src: "/assets/galeria5.jpg", alt: "Equipamiento médico" },
  { src: "/assets/galeria6.jpeg", alt: "Quirófano" },
];

export default function GaleriaClinica() {
  const [imagenActiva, setImagenActiva] = useState<typeof imagenes[0] | null>(null);

  return (
    <section className="relative py-24">

      {/* Fondo full width */}
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-[100vw] bg-white -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-3">
            Galería de la clínica
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Conocé nuestras instalaciones, espacios y tecnología al servicio de una atención médica de calidad.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {imagenes.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-2xl overflow-hidden shadow-md cursor-pointer group"
              onClick={() => setImagenActiva(img)}
            >
              <div className="relative w-full h-72">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MODAL IMAGEN */}
      <AnimatePresence>
        {imagenActiva && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setImagenActiva(null)}
                className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full hover:bg-black"
              >
                <X />
              </button>

              <div className="relative w-full h-[70vh]">
                <Image
                  src={imagenActiva.src}
                  alt={imagenActiva.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
