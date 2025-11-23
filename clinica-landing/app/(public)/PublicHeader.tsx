"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PublicHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-sm sticky top-0 z-30"
    >
      <div className="container mx-auto px-6 max-w-[1400px] flex items-center h-20 md:h-24">

        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/"
            className="flex items-center gap-4"
            aria-label="Ir al inicio - Clínica San Rafael"
          >
            <Image
              src="/assets/logo-clinica.png"
              alt="Clínica San Rafael"
              width={280}
              height={120}
              className="h-14 md:h-16 w-auto object-contain"
              priority
            />
          </Link>
        </motion.div>

        {/* NAV DESKTOP (más a la derecha con ml-auto) */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="hidden md:flex items-center gap-10 text-[15px] ml-auto"
        >
          <Link href="#servicios" className="text-slate-700 hover:text-slate-900">
            Servicios
          </Link>
          <Link href="#equipo" className="text-slate-700 hover:text-slate-900">
            Equipo
          </Link>
          <Link href="#contacto" className="text-slate-700 hover:text-slate-900">
            Contacto
          </Link>
          <Link
            href="/turnos"
            className="px-5 py-2 rounded-md bg-[var(--brand-500)] text-white font-medium hover:opacity-90 transition"
          >
            Pedir turno
          </Link>
        </motion.nav>

        {/* BOTÓN MOBILE */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
          className="md:hidden ml-auto"
        >
          <Link
            href="/turnos"
            className="px-4 py-2 rounded bg-[var(--brand-500)] text-white text-sm"
          >
            Turnos
          </Link>
        </motion.div>

      </div>
    </motion.header>
  );
}
