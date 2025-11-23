Developer docs - Endpoints & Server Actions

1) crearTurno (Server Action)
Input (crearTurnoSchema):
{
    clinicId: string (uuid),
    profesionalId: string (uuid),
    especialidadId: string (uuid),
    fecha: string (ISO datetime),
    paciente: {
        nombre, apellido, dni, email, telefono?, obraSocialId?
    },
    motivo?: string
}
Response:
{ turnoId: string, codigo: string }

2) cancelarTurno (Server Action)
Input:
{ codigo?: string, turnoId?: string, motivo?: string }
Response:
{ ok: true, updated: number }

3) reprogramarTurno (Server Action)
Input:
{ codigo?: string, turnoId?: string, nuevaFecha: string (ISO), motivo?: string }
Response:
{ turnoId: string, codigo: string }

4) crearProfesional (Server Action)
Input:
{
  clinicId: string,
  nombre: string,
  matricula: string,
  fotoUrl?: string,
  especialidadIds?: string[],
  horarios?: [{diaSemana, horaInicio, horaFin, intervaloMin}],
  clerkId?: string
}
Response: { profesionalId: string }

5) crearEspecialidad
Input:
{ clinicId, nombre, duracion, descripcion? }
Response: { id: string }

6) registrarPaciente
Input:
{ clinicId, nombre, apellido, dni, email, telefono?, obraSocialId? }
Response: { pacienteId: string }

API: /api/turnos?codigo=CODE
- GET returns turno JSON
- GET with ?pdf=1 returns PDF file

API: /api/turnos/export?clinicId=UUID
- GET returns CSV export for admin usage
