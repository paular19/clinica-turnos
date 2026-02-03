import React from "react";

type Props = {
    turno: any;
    paciente: any;
    tipo: "creacion" | "cancelacion" | "reprogramacion";
    motivo?: string;
};

const tiposConfig = {
    creacion: {
        titulo: "✓ Turno Confirmado",
        color: "#4bbde3",
        colorDark: "#2b8fb8",
        mensaje: "Tu turno ha sido confirmado exitosamente",
    },
    cancelacion: {
        titulo: "✗ Turno Cancelado",
        color: "#ef4444",
        colorDark: "#dc2626",
        mensaje: "Tu turno ha sido cancelado",
    },
    reprogramacion: {
        titulo: "↻ Turno Reprogramado",
        color: "#f59e0b",
        colorDark: "#d97706",
        mensaje: "Tu turno ha sido reprogramado",
    },
};

export default function TurnoNotificationEmail({
    turno,
    paciente,
    tipo,
    motivo,
}: Props) {
    const config = tiposConfig[tipo];
    const fechaFormateada = turno?.fecha
        ? new Intl.DateTimeFormat("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(turno.fecha))
        : "-";

    return (
        <html>
            <body
                style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
                    backgroundColor: "#f5f5f5",
                    margin: 0,
                    padding: 0,
                }}
            >
                <div
                    style={{
                        maxWidth: "600px",
                        margin: "40px auto",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: `linear-gradient(135deg, ${config.color} 0%, ${config.colorDark} 100%)`,
                            padding: "40px 30px",
                            textAlign: "center",
                        }}
                    >
                        <h1
                            style={{
                                color: "#ffffff",
                                fontSize: "28px",
                                fontWeight: "600",
                                margin: "0 0 10px 0",
                            }}
                        >
                            {config.titulo}
                        </h1>
                        <p
                            style={{
                                color: "rgba(255, 255, 255, 0.9)",
                                fontSize: "16px",
                                margin: 0,
                            }}
                        >
                            {config.mensaje}
                        </p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "40px 30px" }}>
                        {/* Greeting */}
                        <p
                            style={{
                                fontSize: "16px",
                                color: "#333333",
                                margin: "0 0 20px 0",
                            }}
                        >
                            Hola {paciente?.nombre || ""},
                        </p>

                        {/* Detalles */}
                        <div
                            style={{
                                backgroundColor: "#f9fafb",
                                border: `2px solid ${config.color}`,
                                borderRadius: "8px",
                                padding: "20px",
                                margin: "20px 0",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    color: "#333333",
                                    margin: "0 0 15px 0",
                                }}
                            >
                                Detalles del Turno
                            </h2>

                            <div
                                style={{
                                    display: "grid",
                                    gap: "12px",
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#666666",
                                            margin: 0,
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Código
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#333333",
                                            margin: "4px 0 0 0",
                                            fontFamily: "monospace",
                                            backgroundColor: "#ffffff",
                                            padding: "8px",
                                            borderRadius: "4px",
                                        }}
                                    >
                                        {turno?.codigo || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#666666",
                                            margin: 0,
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Fecha y Hora
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#333333",
                                            margin: "4px 0 0 0",
                                        }}
                                    >
                                        {fechaFormateada}
                                    </p>
                                </div>

                                <div>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#666666",
                                            margin: 0,
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Especialidad
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#333333",
                                            margin: "4px 0 0 0",
                                        }}
                                    >
                                        {turno?.especialidad?.nombre || "-"}
                                    </p>
                                </div>

                                <div>
                                    <p
                                        style={{
                                            fontSize: "12px",
                                            color: "#666666",
                                            margin: 0,
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Profesional
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#333333",
                                            margin: "4px 0 0 0",
                                        }}
                                    >
                                        {turno?.profesional?.nombre || "-"}
                                    </p>
                                </div>

                                {motivo && (
                                    <div>
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                color: "#666666",
                                                margin: 0,
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Motivo
                                        </p>
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                color: "#555555",
                                                margin: "4px 0 0 0",
                                            }}
                                        >
                                            {motivo}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Acciones recomendadas */}
                        {tipo === "cancelacion" && (
                            <div
                                style={{
                                    backgroundColor: "#fef3c7",
                                    border: "1px solid #fcd34d",
                                    borderRadius: "8px",
                                    padding: "15px",
                                    margin: "20px 0",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "14px",
                                        color: "#92400e",
                                        margin: 0,
                                    }}
                                >
                                    Si deseás agendar otro turno, podés hacerlo en nuestro sitio web.
                                </p>
                            </div>
                        )}

                        {/* Footer message */}
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#666666",
                                margin: "20px 0 0 0",
                            }}
                        >
                            Si tenés alguna pregunta, no dudes en contactarnos.
                        </p>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            backgroundColor: "#f9fafb",
                            padding: "20px 30px",
                            textAlign: "center",
                            borderTop: "1px solid #e5e7eb",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#999999",
                                margin: 0,
                            }}
                        >
                            Clínica San Rafael • Turnos Online
                        </p>
                        <p
                            style={{
                                fontSize: "12px",
                                color: "#999999",
                                margin: "8px 0 0 0",
                            }}
                        >
                            Este es un email automático, por favor no respondas a este mensaje.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
