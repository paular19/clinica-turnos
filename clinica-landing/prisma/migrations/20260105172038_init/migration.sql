-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MEDICO');

-- CreateEnum
CREATE TYPE "TurnoEstado" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ASISTIDO', 'CANCELADO', 'REPROGRAMADO');

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesional" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "matricula" TEXT,
    "fotoUrl" TEXT,
    "usuarioId" TEXT,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Especialidad" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Especialidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Horario" (
    "id" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "intervaloMin" INTEGER NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "obraSocialId" TEXT,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "TurnoEstado" NOT NULL,
    "motivo" TEXT,
    "codigo" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "especialidadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL,
    "anticipacionMin" INTEGER NOT NULL,
    "intervaloDefault" INTEGER NOT NULL,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObraSocial" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "ObraSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfesionalObraSocial" (
    "profesionalId" TEXT NOT NULL,
    "obraSocialId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "ProfesionalObraSocial_pkey" PRIMARY KEY ("profesionalId","obraSocialId")
);

-- CreateTable
CREATE TABLE "_ProfesionalEspecialidad" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfesionalEspecialidad_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clerkId_key" ON "Usuario"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_clinicId_idx" ON "Usuario"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_matricula_key" ON "Profesional"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_usuarioId_key" ON "Profesional"("usuarioId");

-- CreateIndex
CREATE INDEX "Profesional_clinicId_idx" ON "Profesional"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Especialidad_nombre_clinicId_key" ON "Especialidad"("nombre", "clinicId");

-- CreateIndex
CREATE INDEX "Horario_profesionalId_clinicId_idx" ON "Horario"("profesionalId", "clinicId");

-- CreateIndex
CREATE INDEX "Paciente_obraSocialId_idx" ON "Paciente"("obraSocialId");

-- CreateIndex
CREATE INDEX "Paciente_clinicId_idx" ON "Paciente"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_clinicId_key" ON "Paciente"("dni", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_email_clinicId_key" ON "Paciente"("email", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_codigo_key" ON "Turno"("codigo");

-- CreateIndex
CREATE INDEX "Turno_fecha_profesionalId_pacienteId_estado_clinicId_idx" ON "Turno"("fecha", "profesionalId", "pacienteId", "estado", "clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_clinicId_key" ON "Configuracion"("clinicId");

-- CreateIndex
CREATE INDEX "ObraSocial_clinicId_idx" ON "ObraSocial"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "ObraSocial_nombre_clinicId_key" ON "ObraSocial"("nombre", "clinicId");

-- CreateIndex
CREATE INDEX "ProfesionalObraSocial_clinicId_idx" ON "ProfesionalObraSocial"("clinicId");

-- CreateIndex
CREATE INDEX "_ProfesionalEspecialidad_B_index" ON "_ProfesionalEspecialidad"("B");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Especialidad" ADD CONSTRAINT "Especialidad_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_especialidadId_fkey" FOREIGN KEY ("especialidadId") REFERENCES "Especialidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuracion" ADD CONSTRAINT "Configuracion_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObraSocial" ADD CONSTRAINT "ObraSocial_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfesionalObraSocial" ADD CONSTRAINT "ProfesionalObraSocial_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfesionalObraSocial" ADD CONSTRAINT "ProfesionalObraSocial_obraSocialId_fkey" FOREIGN KEY ("obraSocialId") REFERENCES "ObraSocial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfesionalObraSocial" ADD CONSTRAINT "ProfesionalObraSocial_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfesionalEspecialidad" ADD CONSTRAINT "_ProfesionalEspecialidad_A_fkey" FOREIGN KEY ("A") REFERENCES "Especialidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfesionalEspecialidad" ADD CONSTRAINT "_ProfesionalEspecialidad_B_fkey" FOREIGN KEY ("B") REFERENCES "Profesional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
