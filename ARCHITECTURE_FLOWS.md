# 📚 Documentación de Arquitectura - Sistema de Turnos

## 🏗️ Estructura del Monorepo

Este proyecto está organizado como un **monorepo** con dos aplicaciones Next.js:

```
clinica-turnos/
├── 📁 app/                           # ⚙️ ADMIN APP (puerto 3000)
│   ├── (public)/turnos/              # Rutas públicas básicas
│   │   ├── [codigo]/download/       # Descarga PDF de turno
│   │   └── export/                  # Exportar CSV
│   └── (admin)/                     # Panel de administración
│
├── 📁 clinica-landing/               # 🌐 LANDING PÚBLICO (puerto 3001)
│   └── app/(public)/turnos/         # Flujo completo de solicitud
│       ├── page.tsx                 # Menú principal
│       ├── mis-turnos/              # Consultar turnos
│       └── solicitar/               # Flujo de 4 pasos ⭐
│
├── 📁 lib/                          # Código compartido
│   ├── actions/                     # Server Actions
│   ├── queries/                     # Queries de BD
│   ├── db/                          # Cliente Prisma
│   ├── email/                       # Envío de emails
│   └── pdf/                         # Generación de PDFs
│
└── 📁 prisma/                       # Base de datos
    ├── schema.prisma                # Schema compartido
    └── seed.ts                      # Datos de prueba
```

---

## 🔄 Flujo de Solicitud de Turno (Landing)

### Vista General
```
Usuario → [Paso 1] → [Paso 2] → [Paso 3] → [Paso 4] → DB + Email
           ↓          ↓          ↓          ↓
      Obra Social  Especialidad Médico   Fecha/Hora
```

### Detalle de cada paso

#### **Paso 1: `/turnos/solicitar`**
```typescript
// Archivo: clinica-landing/app/(public)/turnos/solicitar/page.tsx
// Server Action: handlePaso1()

Inputs:
  - nombre: string
  - email: string
  - obraSocialId: UUID

Validación:
  ✓ nombre.length >= 2
  ✓ email válido
  ✓ obraSocialId existe

Query:
  listObrasSociales() → Todas las obras sociales activas

Resultado:
  → redirect(`/turnos/solicitar/especialidad?nombre=X&email=Y&obraSocialId=Z`)
```

#### **Paso 2: `/turnos/solicitar/especialidad`**
```typescript
// Archivo: clinica-landing/app/(public)/turnos/solicitar/especialidad/page.tsx
// Server Action: handleSelect()

Inputs (query params):
  - nombre, email, obraSocialId (del paso anterior)
  - especialidadId: UUID (nuevo)

Query:
  listEspecialidadesPorObraSocial(obraSocialId)
  → Busca profesionales con esa obra social
  → Extrae especialidades únicas
  → Ordena alfabéticamente

Lógica:
  1. Obtener profesionales que aceptan obraSocialId
  2. Extraer todas sus especialidades (N:N)
  3. Deduplicar por especialidad.id
  4. Retornar lista ordenada

Resultado:
  → redirect(`/turnos/solicitar/profesionales?...&especialidadId=W`)
```

#### **Paso 3: `/turnos/solicitar/profesionales`**
```typescript
// Archivo: clinica-landing/app/(public)/turnos/solicitar/profesionales/page.tsx
// Componente: Server Component (no action)

Inputs (query params):
  - nombre, email, obraSocialId, especialidadId (acumulados)

Query:
  listProfesionalesPorObraSocialYEspecialidad(obraSocialId, especialidadId)
  → WHERE profesional.obraSociales CONTAINS obraSocialId
  → AND profesional.especialidades CONTAINS especialidadId

UI:
  - Grid de tarjetas con foto/placeholder
  - Botón "Elegir" por cada profesional

Resultado:
  → Link a `/turnos/solicitar/horario?...&profesionalId=P`
```

#### **Paso 4: `/turnos/solicitar/horario`**
```typescript
// Archivo: clinica-landing/app/(public)/turnos/solicitar/horario/page.tsx
// Server Action: handleSubmitTurno()

Inputs (query params + form):
  - nombre, email, obraSocialId, especialidadId, profesionalId
  - fecha: YYYY-MM-DD
  - hora: HH:MM

Proceso:
  1. Combinar fecha + hora → Date object
  2. Separar nombre en nombre/apellido
  3. Obtener clinicId (primera clínica por defecto)
  4. Llamar crearTurno() de lib/actions/turnos.ts:
     - Valida slot disponible (no doble booking)
     - Valida horario del médico (día + intervalo)
     - Valida obra social aceptada
     - Crea/actualiza paciente (upsert por DNI)
     - Crea turno con código único
     - Envía email de confirmación
     - Revalida rutas

Resultado:
  → redirect(`/turnos/confirmacion?codigo=ABC12345`)
```

---

## 🗂️ Estructura de Archivos y Responsabilidades

### **1. Raíz: Admin App** (`app/`)

#### `app/(public)/turnos/[codigo]/download/route.ts`
```typescript
// Server Route: Descarga PDF de comprobante
export async function GET(request, { params })
  1. Obtener turno por código
  2. Generar PDF con generateComprobantePDF()
  3. Retornar Response con Content-Type: application/pdf
```

#### `app/(public)/turnos/export/route.ts`
```typescript
// Server Route: Exportar turnos a CSV
export async function GET(request)
  1. Leer clinicId de query params
  2. Obtener turnos con prisma.turno.findMany()
  3. Generar CSV con headers
  4. Retornar Response con Content-Type: text/csv
```

### **2. Landing: Public App** (`clinica-landing/`)

#### `clinica-landing/lib/actions/turnos-queries.ts`
```typescript
// ⚠️ SOLO LECTURA - NO CREA TURNOS

export async function listObrasSociales()
  → prisma.obraSocial.findMany({ activa: true })

export async function listEspecialidadesPorObraSocial(obraSocialId)
  1. Buscar profesionales con obraSociales.some({ obraSocialId })
  2. Extraer especialidades.forEach()
  3. Deduplicar con Map<especialidadId, especialidad>
  4. Retornar Array ordenado

export async function listProfesionalesPorObraSocialYEspecialidad(obraId, especId)
  → prisma.profesional.findMany({
      obraSociales: { some: { obraSocialId } },
      especialidades: { some: { id: especialidadId } }
    })
```

### **3. Shared: Lib de Raíz** (`lib/`)

#### `lib/actions/turnos.ts`
```typescript
// ✅ OPERACIONES DE ESCRITURA

export async function crearTurno(data: CrearTurnoInput)
  Validaciones:
    1. validarSlotYCompatibilidad() dentro de $transaction:
       - Profesional atiende esa especialidad
       - Profesional acepta esa obra social
       - Horario.diaSemana coincide con fecha.day
       - Horario.horaInicio <= hora < horaFin
       - (hora - horaInicio) % intervaloMin === 0
       - No existe otro turno en ese slot (no cancelado)
    
    2. upsert paciente por dni_clinicId
    
    3. crear turno con código único (genCodigo())
    
    4. sendConfirmationEmail() con pdfUrl
    
    5. revalidatePaths(['/turnos/confirmacion', '/admin/turnos'])
  
  Retorna: { turnoId, codigo }

export async function cancelarTurno(input)
  → updateMany({ estado: 'CANCELADO' })

export async function reprogramarTurno(input)
  1. Validar nuevo slot
  2. Marcar turno viejo como REPROGRAMADO
  3. Crear nuevo turno con nueva fecha
  4. Enviar email
```

#### `lib/queries/turnos.ts`
```typescript
export async function getTurnoByCodigo(codigo)
  → findUnique con includes de paciente/profesional/especialidad

export async function getDisponibilidadProfesional({ profesionalId, dateISO })
  1. Obtener horarios del día (isoDow)
  2. Generar slots cada intervaloMin
  3. Filtrar ocupados (turnos existentes)
  4. Retornar array de "HH:MM" disponibles
```

#### `lib/db/prisma.ts`
```typescript
// Cliente singleton con hot reload en desarrollo
export const prisma = global.__prisma ?? new PrismaClient()
```

---

## 🗄️ Modelos de Base de Datos (Prisma)

### Modelo clave: `ProfesionalObraSocial`
```prisma
model ProfesionalObraSocial {
  profesionalId String
  obraSocialId  String
  clinicId      String
  
  profesional   Profesional @relation(...)
  obraSocial    ObraSocial  @relation(...)
  clinic        Clinic      @relation(...)
  
  @@id([profesionalId, obraSocialId])
}
```
**Propósito:** Relación N:N entre profesionales y obras sociales

### Relaciones importantes
```
Profesional ←→ ProfesionalObraSocial ←→ ObraSocial
Profesional ←→ Especialidad (N:N directo)
Profesional ←→ Horario (1:N)
Turno → Profesional (N:1)
Turno → Especialidad (N:1)
Turno → Paciente (N:1)
Paciente → ObraSocial (N:1, opcional)
```

---

## 🔐 Validaciones y Reglas de Negocio

### **1. Creación de Turno** (`crearTurno`)

#### Validación de Slot
```typescript
async function validarSlotYCompatibilidad(tx, params) {
  // 1. Profesional + Especialidad
  const prof = await tx.profesional.findFirst({
    where: {
      id: profesionalId,
      especialidades: { some: { id: especialidadId } }
    }
  })
  if (!prof) throw "El profesional no atiende esa especialidad"
  
  // 2. Obra Social (si aplica)
  if (obraSocialId) {
    const acepta = await tx.profesionalObraSocial.findFirst({
      where: { profesionalId, obraSocialId }
    })
    if (!acepta) throw "El profesional no atiende con esa obra social"
  }
  
  // 3. Horario válido
  const diaSemana = isoDow(fecha) // 1=Lun, 7=Dom
  const horarios = await tx.horario.findMany({
    where: { profesionalId, diaSemana }
  })
  if (!horarios.length) throw "El médico no atiende ese día"
  
  // 4. Alineación al intervalo
  const minutos = fecha.getHours() * 60 + fecha.getMinutes()
  const okSlot = horarios.some(h => {
    const start = toMinutes(h.horaInicio)
    const end = toMinutes(h.horaFin)
    const step = h.intervaloMin
    return minutos >= start && minutos < end && (minutos - start) % step === 0
  })
  if (!okSlot) throw "Horario inválido para la agenda del médico"
  
  // 5. No doble booking
  const conflicto = await tx.turno.findFirst({
    where: {
      profesionalId,
      fecha,
      NOT: { estado: 'CANCELADO' }
    }
  })
  if (conflicto) throw "Ese horario ya fue reservado"
}
```

### **2. Generación de Código Único**
```typescript
// lib/utils/sanitize.ts
function genCodigo() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
  // Ejemplo: "K7R2P9XM"
}
```

### **3. Email de Confirmación**
```typescript
// lib/email/sendConfirmationEmail.ts
await sendConfirmationEmail({
  to: paciente.email,
  turno: {
    codigo: "ABC123",
    fecha: new Date("2025-01-15T10:00"),
    profesional: { nombre: "Dr. García" },
    especialidad: { nombre: "Cardiología" }
  },
  paciente: { nombre: "Juan", apellido: "Pérez" },
  pdfUrl: "http://localhost:3000/turnos/ABC123/download"
})
```

---

## 🚦 Estados de Turno

```typescript
enum TurnoEstado {
  PENDIENTE      // Creado, esperando confirmación
  CONFIRMADO     // Confirmado por paciente/admin
  CANCELADO      // Cancelado (no se valida conflicto)
  REPROGRAMADO   // Turno viejo al reprogramar
  COMPLETADO     // Atendido (opcional)
}
```

---

## 🔗 Comunicación entre Apps

### **Landing → Raíz (Imports directos)**
```typescript
// ✅ Permitido: Importar desde ../../../lib/
import { prisma } from "../../../lib/db/prisma"
import { crearTurno } from "../../../../../lib/actions/turnos"
```

### **Raíz → Landing (No importa)**
La raíz **NO** importa nada de `clinica-landing/`

### **APIs compartidas (Server Routes)**
```
GET /turnos/[codigo]/download  ← Descarga PDF
GET /turnos/export?clinicId=X  ← Exportar CSV
```
Ambas apps pueden hacer `fetch()` a estas rutas.

---

## 📦 Dependencias Clave

```json
{
  "dependencies": {
    "@prisma/client": "^7.2.0",
    "next": "15.0.0",
    "react": "18.2.0",
    "zod": "^3.22.2",
    "nodemailer": "^6.9.1",
    "@react-pdf/renderer": "^3.0.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "prisma": "^7.2.0",
    "typescript": "^5.4.0"
  }
}
```

**Instalación:**
```bash
# Raíz
npm install --legacy-peer-deps --ignore-scripts

# Landing
cd clinica-landing && npm install
```

---

## 🔧 Comandos Útiles

### **Desarrollo**
```bash
# Admin app (raíz)
npm run dev                # Puerto 3000

# Landing app
cd clinica-landing
npm run dev                # Puerto 3001
```

### **Base de datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Ver BD en UI
npx prisma studio

# Seed de prueba
npx prisma db seed
```

### **Build de producción**
```bash
# Raíz
npm run build && npm start

# Landing
cd clinica-landing
npm run build && npm start
```

---

## 🐛 Debugging

### Ver queries de Prisma
```typescript
// lib/db/prisma.ts
new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "info", "warn"] 
    : []
})
```

### Logs de Server Actions
```typescript
console.log("FormData recibida:", Object.fromEntries(formData))
```

### Errores comunes

1. **"Cannot find module '../../lib/...'**
   - ❌ Ruta incorrecta desde `clinica-landing/`
   - ✅ Usar `../../../lib/` (3 niveles)

2. **"Turno.create() missing profesionalId"**
   - ❌ Falta campo requerido en schema
   - ✅ Verificar `CrearTurnoInput` en zod schemas

3. **"El médico no atiende ese día"**
   - ❌ No hay `Horario` para ese `diaSemana`
   - ✅ Crear horarios en seed o admin

4. **"Email no se envía"**
   - ❌ Variables de entorno de Resend/Nodemailer
   - ✅ Verificar `.env` y try/catch en sendEmail

---

## 📚 Referencias

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js 15 Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zod Validation](https://zod.dev/)
- [React Email](https://react.email/)

---

## ✅ Checklist Pre-Deploy

- [ ] Generar Prisma Client: `npx prisma generate`
- [ ] Correr migraciones: `npx prisma migrate deploy`
- [ ] Seed de datos: `npx prisma db seed`
- [ ] Variables de entorno configuradas
- [ ] Build sin errores: `npm run build`
- [ ] Probar flujo completo en local
- [ ] Verificar envío de emails
- [ ] Probar generación de PDFs
