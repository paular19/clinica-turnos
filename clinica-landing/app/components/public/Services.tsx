"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Stethoscope,
  Scan,
  Syringe,
  HeartPulse,
  Hospital,
  Clock,
  FlaskConical,
  Activity,
  Brain,
} from "lucide-react";

type DetalleItem =
  | string
  | {
      titulo: string;
      items: string[];
    };

interface Servicio {
  title: string;
  icon: LucideIcon;
  desc: string;
  detalle: DetalleItem[];
}

export default function ServicesIcons() {
  const servicios: Servicio[] = [
    {
      title: "Guardia e internación",
      icon: Clock,
      desc: "Guardia 24 horas, terapia intensiva e internación para adultos.",
      detalle: [
        "Servicio de guardia externa las 24 horas",
        "Servicio de terapia intensiva",
        "Servicio de internación general para adultos, con habitaciones privadas.",
      ],
    },
    {
      title: "Diagnóstico por imágenes",
      icon: Scan,
      desc: "Radiología digital, tomografía y ecografías.",
      detalle: [
        {
          titulo: "Diagnóstico por imágenes",
          items: [
            "Radiología con digitalizado de imágenes (propio)",
            "Servicio de tomografía con guardias pasivas (terciarizado)",
            "Servicio de ecografías, ecocardiogramas y eco Doppler",
          ],
        },
      ],
    },
    {
      title: "Endoscopia digestiva",
      icon: Syringe,
      desc: "Estudios de endoscopia digestiva alta y baja.",
      detalle: ["Servicio de endoscopia digestiva alta y baja"],
    },
    {
      title: "Cirugía general y especialidades",
      icon: Stethoscope,
      desc: "Cirugía general y múltiples especialidades quirúrgicas.",
      detalle: [
        "Servicio de cirugía, con guardias activas y pasivas de cirugía general",
        "Servicio de cirugía traumatológica",
        "Servicio de cirugía urológica",
        "Servicio de neurocirugía",
        "Servicio de cirugía vascular periférica",
      ],
    },
    {
      title: "Laboratorio y hemoterapia",
      icon: FlaskConical,
      desc: "Laboratorio y hemoterapia de apoyo diagnóstico.",
      detalle: [
        "Servicio de laboratorio de análisis clínicos de alta y baja complejidad (terciarizado)",
        "Servicio de hemoterapia (terciarizado)",
      ],
    },
    {
      title: "Nefrología y diálisis",
      icon: Activity,
      desc: "Atención nefrológica y diálisis para adultos.",
      detalle: ["Servicio de nefrología con diálisis para pacientes adultos."],
    },
    {
      title: "Cardiología",
      icon: HeartPulse,
      desc: "Evaluación y seguimiento de la salud cardiovascular.",
      detalle: ["Servicio de cardiología."],
    },
    {
      title: "Nutrición",
      icon: Hospital,
      desc: "Acompañamiento nutricional integral.",
      detalle: ["Servicio de nutrición."],
    },
    {
      title: "Consultorios externos",
      icon: Brain,
      desc: "Amplia red de especialidades ambulatorias.",
      detalle: [
        {
          titulo: "Consultorios externos",
          items: [
            "Clínica general",
            "Gerontología",
            "Cardiología",
            "Diabetología",
            "Hematología",
            "Cirugía general",
            "Traumatología",
            "Nefrología",
            "Infectología",
            "Nutrición",
            "Medicina laboral",
          ],
        },
      ],
    },
  ];

  return (
    <section className="py-20">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-normal text-center mb-12"
      >
        Servicios de la clínica
      </motion.h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {servicios.map((s, i) => {
          const Icon = s.icon;

          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              viewport={{ once: true }}
              className="relative group p-7 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border overflow-visible"
            >
              {/* CONTENIDO BASE (lo que se ve siempre) */}
              <div className="flex flex-col gap-3">
                <Icon className="h-10 w-10 text-[var(--brand-500)]" />
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-slate-600 text-sm">{s.desc}</p>
              </div>

              {/* PANEL DE DETALLE EN HOVER (tipo tooltip grande) */}
              <div className="pointer-events-none absolute left-0 top-full mt-3 w-[min(22rem,90vw)] rounded-2xl bg-white shadow-2xl border border-slate-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-20">
                <div className="p-4">
                  <h4 className="font-semibold text-sm mb-2 text-slate-900">
                    Detalle de servicio
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-2 leading-relaxed max-h-64 overflow-y-auto pr-1">
                    {s.detalle.map((item, idx) => {
                      if (typeof item === "string") {
                        return <li key={idx}>• {item}</li>;
                      }

                      return (
                        <li key={idx}>
                          <span className="font-semibold">{item.titulo}</span>
                          <ul className="mt-1 ml-4 list-disc space-y-1">
                            {item.items.map((sub, j) => (
                              <li key={j}>{sub}</li>
                            ))}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
