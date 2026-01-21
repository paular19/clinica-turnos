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
    <section className="relative py-20 overflow-hidden bg-white min-h-screen w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      {/* Background con líneas elegantes */}
      <div className="absolute inset-0 top-24 overflow-hidden w-full">
        {/* Elementos decorativos sutiles */}
        <div className="absolute top-20 right-32 w-96 h-96 bg-gradient-to-br from-orange-300/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-to-tl from-orange-200/12 to-transparent rounded-full blur-3xl" />

        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 800"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ff8c42', stopOpacity: 0.3 }} />
              <stop offset="50%" style={{ stopColor: '#ffa500', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: '#ff9966', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>

          {/* Línea ondulada 1 - superior */}
          <path
            d="M-50,120 Q180,60 360,120 Q540,180 720,120 Q900,60 1080,120 Q1260,180 1490,120"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.8"
          >
            <animate
              attributeName="d"
              dur="22s"
              repeatCount="indefinite"
              values="M-50,120 Q180,60 360,120 Q540,180 720,120 Q900,60 1080,120 Q1260,180 1490,120;
                      M-50,120 Q180,180 360,120 Q540,60 720,120 Q900,180 1080,120 Q1260,60 1490,120;
                      M-50,120 Q180,60 360,120 Q540,180 720,120 Q900,60 1080,120 Q1260,180 1490,120"
            />
          </path>

          {/* Línea ondulada 2 */}
          <path
            d="M-50,200 Q180,140 360,200 Q540,260 720,200 Q900,140 1080,200 Q1260,260 1490,200"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate
              attributeName="d"
              dur="26s"
              repeatCount="indefinite"
              values="M-50,200 Q180,140 360,200 Q540,260 720,200 Q900,140 1080,200 Q1260,260 1490,200;
                      M-50,200 Q180,260 360,200 Q540,140 720,200 Q900,260 1080,200 Q1260,140 1490,200;
                      M-50,200 Q180,140 360,200 Q540,260 720,200 Q900,140 1080,200 Q1260,260 1490,200"
            />
          </path>

          {/* Línea ondulada 3 - central */}
          <path
            d="M-50,320 Q180,260 360,320 Q540,380 720,320 Q900,260 1080,320 Q1260,380 1490,320"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          >
            <animate
              attributeName="d"
              dur="30s"
              repeatCount="indefinite"
              values="M-50,320 Q180,260 360,320 Q540,380 720,320 Q900,260 1080,320 Q1260,380 1490,320;
                      M-50,320 Q180,380 360,320 Q540,260 720,320 Q900,380 1080,320 Q1260,260 1490,320;
                      M-50,320 Q180,260 360,320 Q540,380 720,320 Q900,260 1080,320 Q1260,380 1490,320"
            />
          </path>

          {/* Línea ondulada 4 */}
          <path
            d="M-50,420 Q180,360 360,420 Q540,480 720,420 Q900,360 1080,420 Q1260,480 1490,420"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          >
            <animate
              attributeName="d"
              dur="28s"
              repeatCount="indefinite"
              values="M-50,420 Q180,360 360,420 Q540,480 720,420 Q900,360 1080,420 Q1260,480 1490,420;
                      M-50,420 Q180,480 360,420 Q540,360 720,420 Q900,480 1080,420 Q1260,360 1490,420;
                      M-50,420 Q180,360 360,420 Q540,480 720,420 Q900,360 1080,420 Q1260,480 1490,420"
            />
          </path>

          {/* Línea ondulada 5 */}
          <path
            d="M-50,540 Q180,480 360,540 Q540,600 720,540 Q900,480 1080,540 Q1260,600 1490,540"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate
              attributeName="d"
              dur="24s"
              repeatCount="indefinite"
              values="M-50,540 Q180,480 360,540 Q540,600 720,540 Q900,480 1080,540 Q1260,600 1490,540;
                      M-50,540 Q180,600 360,540 Q540,480 720,540 Q900,600 1080,540 Q1260,480 1490,540;
                      M-50,540 Q180,480 360,540 Q540,600 720,540 Q900,480 1080,540 Q1260,600 1490,540"
            />
          </path>

          {/* Línea ondulada 6 - inferior */}
          <path
            d="M-50,640 Q180,580 360,640 Q540,700 720,640 Q900,580 1080,640 Q1260,700 1490,640"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.8"
          >
            <animate
              attributeName="d"
              dur="27s"
              repeatCount="indefinite"
              values="M-50,640 Q180,580 360,640 Q540,700 720,640 Q900,580 1080,640 Q1260,700 1490,640;
                      M-50,640 Q180,700 360,640 Q540,580 720,640 Q900,700 1080,640 Q1260,580 1490,640;
                      M-50,640 Q180,580 360,640 Q540,700 720,640 Q900,580 1080,640 Q1260,700 1490,640"
            />
          </path>
        </svg>
      </div>

      {/* Contenido */}
      <div className="relative z-10">
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
                className="relative group p-7 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border hover:border-[var(--gold)] overflow-visible"
              >
                {/* CONTENIDO BASE (lo que se ve siempre) */}
                <div className="flex flex-col gap-3">
                  <Icon className="h-10 w-10 text-[var(--brand-500)] group-hover:text-[var(--gold)] transition-colors" />
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
      </div>
    </section>
  );
}
