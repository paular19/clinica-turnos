import React from "react";

type Props = {
  turno: any;
  paciente: any;
  pdfUrl?: string;
};

export default function ConfirmationEmail({ turno, paciente, pdfUrl }: Props) {
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
      <body style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        margin: 0,
        padding: 0
      }}>
        <div style={{
          maxWidth: "600px",
          margin: "40px auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #4bbde3 0%, #2b8fb8 100%)",
            padding: "40px 30px",
            textAlign: "center"
          }}>
            <h1 style={{
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "600",
              margin: "0 0 10px 0"
            }}>
              ✓ Turno Confirmado
            </h1>
            <p style={{
              color: "#e8f7fc",
              fontSize: "16px",
              margin: 0
            }}>
              Tu turno ha sido agendado exitosamente
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "30px" }}>
            <p style={{
              fontSize: "16px",
              color: "#333",
              marginTop: 0
            }}>
              Hola <strong>{paciente?.nombre} {paciente?.apellido}</strong>,
            </p>

            <p style={{ fontSize: "15px", color: "#666", lineHeight: "1.6" }}>
              Tu turno ha sido confirmado con el siguiente código:
            </p>

            {/* Código destacado */}
            <div style={{
              backgroundColor: "#f0f9fc",
              border: "2px solid #4bbde3",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
              margin: "20px 0"
            }}>
              <p style={{
                fontSize: "14px",
                color: "#666",
                margin: "0 0 8px 0",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                Código de turno
              </p>
              <p style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#4bbde3",
                margin: 0,
                letterSpacing: "2px"
              }}>
                {turno?.codigo}
              </p>
            </div>

            {/* Detalles del turno */}
            <div style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{
                      padding: "12px 0",
                      fontSize: "14px",
                      color: "#666",
                      borderBottom: "1px solid #e0e0e0"
                    }}>
                      📅 Fecha y hora
                    </td>
                    <td style={{
                      padding: "12px 0",
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "600",
                      textAlign: "right",
                      borderBottom: "1px solid #e0e0e0"
                    }}>
                      {fechaFormateada}
                    </td>
                  </tr>
                  <tr>
                    <td style={{
                      padding: "12px 0",
                      fontSize: "14px",
                      color: "#666",
                      borderBottom: "1px solid #e0e0e0"
                    }}>
                      👨‍⚕️ Profesional
                    </td>
                    <td style={{
                      padding: "12px 0",
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "600",
                      textAlign: "right",
                      borderBottom: "1px solid #e0e0e0"
                    }}>
                      {turno?.profesional?.nombre || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{
                      padding: "12px 0",
                      fontSize: "14px",
                      color: "#666"
                    }}>
                      🏥 Especialidad
                    </td>
                    <td style={{
                      padding: "12px 0",
                      fontSize: "14px",
                      color: "#333",
                      fontWeight: "600",
                      textAlign: "right"
                    }}>
                      {turno?.especialidad?.nombre || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Botón de descarga */}
            {pdfUrl && (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <a
                  href={pdfUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#4bbde3",
                    color: "#ffffff",
                    padding: "14px 32px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "background-color 0.3s"
                  }}
                >
                  📄 Descargar Comprobante
                </a>
              </div>
            )}

            {/* Nota importante */}
            <div style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "8px",
              padding: "16px",
              marginTop: "20px"
            }}>
              <p style={{
                fontSize: "14px",
                color: "#856404",
                margin: 0,
                lineHeight: "1.6"
              }}>
                <strong>⚠️ Importante:</strong> Guardá este código de turno. Lo necesitarás para consultar o modificar tu turno.
              </p>
            </div>

            <p style={{
              fontSize: "15px",
              color: "#666",
              marginTop: "30px",
              lineHeight: "1.6"
            }}>
              Gracias por confiar en nosotros.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "20px 30px",
            textAlign: "center",
            borderTop: "1px solid #e0e0e0"
          }}>
            <p style={{
              fontSize: "13px",
              color: "#999",
              margin: 0
            }}>
              Clínica San Rafael - Sistema de Gestión de Turnos
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
