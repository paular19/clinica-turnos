# 🏗️ Arquitectura del Proyecto - Monorepo

Este es un **monorepo** con dos aplicaciones Next.js independientes:
1. **App Principal** (raíz `/`) - Sistema administrativo y de gestión
2. **Landing Clínica** (`/clinica-landing`) - Sitio público con formulario de solicitud

---

## 📂 Estructura de Carpetas

```
clinica-turnos/
│
├── 📁 lib/                           [COMPARTIDO] Lógica del admin
│   ├── actions/
│   │   ├── serverAdmin.ts           ← Acciones admin (crear profesionales, especialidades)
│   │   ├── serverTurnos.ts          ← Acciones turnos admin (crear, editar, cancelar)
│   │   │   └── solicitudTurnoPublica() ← Acción pública para landing
│   │   └── index.ts
│   ├── queries/
│   │   ├── turnos.ts                ← Queries: listar, filtrar turnos
│   │   ├── pacientes.ts
│   │   ├── profesionales.ts
│   │   ├── especialidades.ts
│   │   └── index.ts
│   ├── zod/
│   │   └── schemas.ts               ← Validaciones compartidas (Zod)
│   ├── email/                        ← Utilidades email
│   ├── pdf/                          ← Generación PDF
│   ├── db/
│   │   └── prisma.ts                ← Cliente Prisma
│   └── utils/
│
├── 📁 app/                           [APP ADMIN] Sistema administrativo
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   ├── medico/
│   │   └── paciente/
│   ├── api/                          ← Rutas API (si necesarias)
│   └── layout.tsx
│
├── 📁 prisma/                        ← Esquema ORM (compartido)
│   ├── schema.prisma
│   └── migrations/
│
├── 📁 clinica-landing/               [LANDING PÚBLICA]
│   ├── package.json                 ← Dependencies: next, react (mínimas)
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx             ← Home
│   │   │   └── turnos/
│   │   │       ├── page.tsx         ← Hub de turnos (enlaces)
│   │   │       ├── solicitar/
│   │   │       │   ├── page.tsx     ← Formulario solicitud
│   │   │       │   └── components/TurnoForm.tsx
│   │   │       └── confirmacion/
│   │   │           └── page.tsx     ← Validar código turno
│   │   └── components/              ← Componentes landing
│   │
│   ├── lib/
│   │   └── actions/
│   │       └── turnos.ts            ← Envoltorio que importa desde raíz
│   │                                  (TODO: Considerar usar monorepo workspace)
│   │
│   └── styles/
│
├── 📁 tests/                         ← Tests
│
├── 📄 package.json                   [RAÍZ] App admin
├── 📄 package-lock.json
├── 📄 tsconfig.json
├── 📄 next.config.js
│
└── 📄 ARCHITECTURE.md               ← Este archivo
```

---

## 🎯 Responsabilidades

### `/lib` (Raíz - APP ADMIN)
**Toda la lógica compartida y acciones administrativas**

```typescript
// ✅ EN /lib/actions/serverTurnos.ts
export async function crearTurno(data: CrearTurnoInput) 
  // Acción ADMIN: crear turno completo con paciente + profesional

export async function cancelarTurno(input: CancelarTurnoInput)
  // Acción ADMIN: cancelar turno

export async function reprogramarTurno(input: ReprogramTurnoInput)
  // Acción ADMIN: reprogramar turno

export async function solicitudTurnoPublica(formData: FormData)
  // ⭐ Acción PÚBLICA: crear turno simple desde landing
  // Crea paciente automático + turno sin profesional asignado (admin lo asigna)
```

### `/app` (Raíz - APP ADMIN)
**Sistema administrativo completo**

- Dashboard de admin
- Gestión de turnos (crear, editar, cancelar, reprogramar)
- Gestión de profesionales
- Gestión de pacientes
- Reports

### `/clinica-landing` (LANDING PÚBLICA)
**Solo sitio web público con formulario de solicitud**

- Página principal
- Galería, servicios, equipo
- Formulario: "Solicitar Turno"
  - Recolecta: nombre, email, fecha, hora, especialidad
  - Llama a `solicitudTurnoPublica()` desde raíz
  - Turno se guarda sin profesional (admin lo asigna)

---

## 🔄 Flujo: Solicitud de Turno (Landing)

```
1. Usuario en clinica-landing/app/(public)/turnos/solicitar
   └─ Completa TurnoForm.tsx

2. TurnoForm.tsx envía FormData a acción:
   └─ clinica-landing/lib/actions/turnos.ts::solicitudTurno()

3. Acción valida con Zod:
   ✓ nombre (string, min 2)
   ✓ email (válido)
   ✓ fecha (date)
   ✓ hora (time)
   ✓ especialidad (string)

4. Si es válido, llamaría a:
   └─ /lib/actions/serverTurnos.ts::solicitudTurnoPublica()
      (Actualmente solo logea - TODO implementar)

5. serverTurnoPublica() hace:
   ├─ Busca o crea Paciente (por email)
   ├─ Busca Especialidad
   ├─ Crea Turno (sin profesional asignado)
   ├─ Envía email de confirmación
   └─ Retorna { success, codigo, message }

6. Usuario recibe confirmación:
   └─ "Solicitud recibida. Código: ABC123"
```

---

## ⚙️ Flujo: Crear Turno (Admin)

```
1. Admin en /app/dashboard/turnos/crear
   └─ Completa formulario completo

2. Envía a acción admin:
   └─ /lib/actions/serverTurnos.ts::crearTurno()

3. Acción ADMIN hace:
   ├─ Valida datos completos con Zod
   ├─ Sanitiza strings
   ├─ Transacción Prisma:
   │  ├─ Upsert Paciente (por DNI)
   │  └─ Crea Turno (con profesional + especialidad)
   ├─ Envía email
   └─ Retorna turnoId + código
```

---

## 🚀 Despliegue

### App Admin (Raíz)
```bash
# En Vercel, configurar:
# Root Directory: . (raíz)
```

### Landing (clinica-landing)
```bash
# En Vercel, crear nuevo proyecto:
# Root Directory: clinica-landing
# Environment: Heredar de app admin (misma DB)
```

---

## 📋 Reglas de Oro

### ✅ DO
- Compartir esquemas Zod en `/lib/zod/schemas.ts`
- Compartir queries en `/lib/queries/`
- Compartir Prisma cliente en `/lib/db/prisma.ts`
- Landing importa acciones de raíz (cuando sea posible)

### ❌ DON'T
- No duplicar acciones en landing y raíz
- No tener dependencias diferentes (usar package-lock.json compartido)
- No acceder directamente a Prisma desde landing (usar acciones)

---

## 🔗 Importaciones

### Desde Landing hacia Raíz (⚠️ Limitado)
```typescript
// ❌ EVITAR (imports relativos no resuelven bien en monorepo)
import { solicitudTurno } from "../../../lib/actions/turnos"

// ✅ ALTERNATIVA ACTUAL (duplicar con comentario)
// clinica-landing/lib/actions/turnos.ts
// Nota: Duplica lógica de raíz. Considerar npm workspaces para mejorar.
```

### Desde App Admin (Raíz)
```typescript
// ✅ BIEN (path local)
import { prisma } from "@/lib/db/prisma"
import { solicitudTurnoSchema } from "@/lib/zod/schemas"
import { crearTurno } from "@/lib/actions/serverTurnos"
```

---

## 🎓 Ejemplo: Agregar nueva funcionalidad

### Agregar "Mis Turnos" en Landing

1. **Query en `/lib/queries/turnos.ts`:**
   ```typescript
   export async function obtenerTurnosPorEmail(email: string) {
     return prisma.turno.findMany({
       where: { paciente: { email } },
       include: { especialidad: true }
     })
   }
   ```

2. **Página en `clinica-landing/app/(public)/turnos/mis-turnos/page.tsx`:**
   ```typescript
   import { obtenerTurnosPorEmail } from "@/lib/queries/turnos" // De raíz
   
   export default async function MisTurnosPage() {
     const email = "user@email.com" // De Clerk/auth
     const turnos = await obtenerTurnosPorEmail(email)
     return <TurnosList turnos={turnos} />
   }
   ```

---

## 📝 TODO

- [ ] Implementar `solicitudTurnoPublica()` completo en landing
- [ ] Considerar usar npm workspaces (`clinica-landing` como workspace)
- [ ] Documentar variables de entorno (.env.example)
- [ ] Agregar tests para acciones
