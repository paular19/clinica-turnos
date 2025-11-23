'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function Contact() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Contacto (demo):', { nombre, email, mensaje });
    setNombre('');
    setEmail('');
    setMensaje('');
    alert('Mensaje enviado (demo)');
  }

  return (
    <section className="relative">

      {/* fondo full width */}
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-[100vw] bg-[#f8fbfd] -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* COLUMNA INFO + FORM */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-slate-800">Contacto</h3>

            <div className="space-y-4 text-slate-700 mb-8">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--brand-500)] mt-1" />
                <span>
                  Av. Sarmiento 566, Salta Capital, Argentina
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--brand-500)]" />
                <span>Teléfono fijo: 4318111</span>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[var(--brand-500)]" />
                <a
                  href="https://wa.link/qks17s"
                  target="_blank"
                  className="text-[var(--brand-500)] hover:underline"
                >
                  WhatsApp: 3872537289
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--brand-500)]" />
                <a
                  href="mailto:sanrafaelsanar@gmail.com"
                  className="hover:underline"
                >
                  sanrafaelsanar@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--brand-500)]" />
                <span>Guardia médica y enfermería las 24hs</span>
              </div>
            </div>

            {/* FORMULARIO */}
            <form className="space-y-3 max-w-md" onSubmit={handleSubmit}>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                placeholder="Nombre"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                placeholder="Email"
                type="email"
              />

              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]"
                placeholder="Mensaje"
                rows={4}
              />

              <button
                type="submit"
                className="px-6 py-3 bg-[var(--brand-500)] text-white rounded-lg hover:opacity-90 transition font-medium"
              >
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* COLUMNA MAPA */}
          <div>
            <h4 className="font-medium mb-3 text-slate-800">Ubicación</h4>

            <div className="h-72 rounded-xl overflow-hidden border shadow-sm">
              <iframe
                title="Ubicación Clínica San Rafael"
                src="https://www.google.com/maps?q=Av.+Sarmiento+566,+Salta,+Argentina&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
              />
            </div>

            <a
              href="https://maps.app.goo.gl/YoM7Nj3vs99mnAfj6"
              target="_blank"
              className="inline-block mt-3 text-sm text-[var(--brand-500)] hover:underline"
            >
              Ver ubicación en Google Maps
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
