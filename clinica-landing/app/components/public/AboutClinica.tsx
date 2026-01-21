"use client";

import { motion } from "framer-motion";
import { Award, Users, Heart, Shield } from "lucide-react";

export default function AboutClinica() {
    const features = [
        {
            icon: Award,
            title: "Excelencia",
            desc: "Más de 30 años de trayectoria en atención médica de calidad",
        },
        {
            icon: Users,
            title: "Equipo experto",
            desc: "Profesionales altamente capacitados en múltiples especialidades",
        },
        {
            icon: Heart,
            title: "Atención humana",
            desc: "Cuidado personalizado centrado en cada paciente",
        },
        {
            icon: Shield,
            title: "Tecnología",
            desc: "Equipamiento de última generación para diagnósticos precisos",
        },
    ];

    return (
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#3ab2e4] via-[#2a9dd4] to-[#d89c6c]">
            {/* Formas decorativas abstractas */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Blobs abstractos */}
                <div className="absolute top-20 -left-20 w-96 h-96 bg-white/8 rounded-full blur-3xl transform rotate-45" />
                <div className="absolute -bottom-10 -right-10 w-[500px] h-[500px] bg-[#d89c6c]/15 blur-3xl"
                    style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }} />
                <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-white/6 blur-2xl transform -translate-x-1/2"
                    style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />

                {/* Electrocardiograma decorativo */}
                <svg className="absolute top-1/3 left-0 w-full h-32 opacity-10" preserveAspectRatio="none" viewBox="0 0 1200 100">
                    <path
                        d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L270,50 L400,50 L420,50 L430,20 L440,80 L450,50 L470,50 L600,50 L620,50 L630,20 L640,80 L650,50 L670,50 L800,50 L820,50 L830,20 L840,80 L850,50 L870,50 L1000,50 L1020,50 L1030,20 L1040,80 L1050,50 L1070,50 L1200,50"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                <svg className="absolute bottom-1/3 right-0 w-full h-32 opacity-10" preserveAspectRatio="none" viewBox="0 0 1200 100">
                    <path
                        d="M0,50 L200,50 L220,50 L230,20 L240,80 L250,50 L270,50 L400,50 L420,50 L430,20 L440,80 L450,50 L470,50 L600,50 L620,50 L630,20 L640,80 L650,50 L670,50 L800,50 L820,50 L830,20 L840,80 L850,50 L870,50 L1000,50 L1020,50 L1030,20 L1040,80 L1050,50 L1070,50 L1200,50"
                        stroke="#d89c6c"
                        strokeWidth="2"
                        fill="none"
                    />
                </svg>

                {/* Formas orgánicas más sutiles */}
                <div className="absolute top-10 right-1/4 w-40 h-40 bg-white/5 blur-xl"
                    style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }} />
                <div className="absolute bottom-20 left-1/4 w-52 h-52 bg-[#d89c6c]/8 blur-2xl"
                    style={{ borderRadius: '70% 30% 30% 70% / 60% 60% 40% 40%' }} />
            </div>

            {/* Contenido */}
            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <h2 className="text-4xl md:text-5xl font-normal text-white mb-6 drop-shadow-lg">
                        Tu salud, nuestra prioridad
                    </h2>
                    <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                        Somos una institución comprometida con tu bienestar,
                        brindando atención integral con calidez humana y profesionalismo.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-center group p-6 rounded-xl bg-white/10 backdrop-blur-sm"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--gold)] mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                    <Icon className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-md">
                                    {feature.title}
                                </h3>
                                <p className="text-white/90 text-sm leading-relaxed drop-shadow">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
