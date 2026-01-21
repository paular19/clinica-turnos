"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroClinicaCompleto() {
  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen flex items-center py-12 px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 w-full items-center">
          
          {/* TEXTO */}
          <motion.div 
            className="order-2 md:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Tu salud, nuestra prioridad
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed">
              Atención médica de excelencia con tecnología de vanguardia y un enfoque humano
            </p>
            <Link 
              href="/turnos"
              className="inline-block bg-[var(--brand-500)] hover:bg-[var(--brand-600)]
              text-white font-semibold px-10 py-5 rounded-xl shadow-lg transition-all duration-300 
              hover:shadow-xl hover:scale-105"
            >
              Solicitar turno
            </Link>
          </motion.div>

          {/* IMAGEN con animación CSS */}
          <div className="order-1 md:order-2 h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl animate-fadeInRight">
            <img 
              src="/assets/fotonueva2.jpg"
              alt="Clínica"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out 0.2s both;
        }
      `}</style>
    </section>
  );
}
