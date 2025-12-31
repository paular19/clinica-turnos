# 🏗️ Arquitectura del Proyecto - Monorepo con Proyectos Independientes

Este es un **monorepo** con dos aplicaciones Next.js completamente independientes:
1. **clinica-admin** (`/clinica-admin`) - Sistema administrativo y de gestión
2. **clinica-landing** (`/clinica-landing`) - Sitio público con formulario de solicitud

Ambos proyectos comparten:
- Carpeta `/lib` - Lógica compartida (actions, queries, utils)
- Carpeta `/prisma` - Schema y migraciones de base de datos

---

## 📂 Estructura de Carpetas

```
clinica-turnos/
│
├── 📁 lib/                           [COMPARTIDO] Lógica reutilizable
│   ├── actions/
│   │   ├── serverAdmin.ts           ← Acciones admin (crear profesionales, especialidades)
│   │   ├── turnos.ts                ← Acciones turnos admin (crear, editar, cancelar)
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
├── 📁 prisma/                        [COMPARTIDO] Esquema ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── 📁 clinica-admin/                 [PROYECTO 1 - ADMIN]
│   ├── package.json                 ← Dependencies: next, react, clerk, etc.
│   ├── tsconfig.json                ← Alias @/lib/* → ../lib/*
│   ├── next.config.js
│   ├── .env                         ← Variables admin
│   ├── app/
│   │   ├── (auth)/                  ← Login con Clerk
│   │   ├── (public)/                ← Páginas públicas (si necesarias)
│   │   ├── (dashboard)/             ← Dashboard admin
│   │   │   ├── admin/
│   │   │   ├── medico/
│   │   │   └── paciente/
│   │   └── layout.tsx
│   └── components/                  ← Componentes admin
│
├── 📁 clinica-landing/               [PROYECTO 2 - LANDING]
│   ├── package.json                 ← Dependencies: next, react (mínimas)
│   ├── tsconfig.json                ← Alias @/lib/* → ../lib/*
│   ├── next.config.js
│   ├── .env                         ← Variables landing
│   ├── app/
│   │   └── (public)/
│   │       ├── page.tsx             ← Home
│   │       └── turnos/
│   │           ├── page.tsx         ← Hub de turnos
│   │           ├── solicitar/       ← Formulario solicitud
│   │           ├── mis-turnos/      ← Consultar turnos
│   │           └── confirmacion/    ← Validar código turno
│   ├── lib/
│   │   └── actions/
│   │       └── mis-turnos-actions.ts ← Server actions específicas
│   └── components/                  ← Componentes landing
│
├── 📄 DEPLOYMENT_GUIDE.md           ← Guía de deployment en Vercel
├── 📄 ARCHITECTURE.md               ← Este archivo
└── 📄 README.md
```

---

## 🎯 Responsabilidades

### `/lib` (Raíz - APP ADMIN)
**Toda la lógica compartida y acciones administrativas**

```typescript
// ✅ EN /lib/actions/serverTurnos.ts
export async function crearTurno(data: CrearTurnoInput) 


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

### Proyectos Independientes en Vercel

Cada proyecto se deploya por separado en Vercel:

#### clinica-admin
```bash
# En Vercel:
# Project Name: clinica-admin
# Root Directory: clinica-admin
# Framework: Next.js
```

#### clinica-landing
```bash
# En Vercel:
# Project Name: clinica-landing
# Root Directory: clinica-landing
# Framework: Next.js
```

**Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones completas**

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

### Desde clinica-admin
```typescript
// ✅ Importar desde lib compartida usando alias
import { prisma } from "@/lib/db/prisma"
import { solicitudTurnoSchema } from "@/lib/zod/schemas"
import { crearTurno } from "@/lib/actions/turnos"
```

### Desde clinica-landing
```typescript
// ✅ Importar desde lib compartida usando alias
import { prisma } from "@/lib/db/prisma"
import { buscarTurnoPorCodigo } from "@/lib/actions/mis-turnos-actions"

// ✅ O importar desde lib local (server actions específicas)
import { cancelarTurno } from "../../../../lib/actions/mis-turnos-actions"
```

**Nota:** Ambos proyectos tienen configurado el alias `@/lib/*` → `../lib/*` en sus `tsconfig.json`

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

- [ ] Configurar dominios personalizados en Vercel
- [ ] Implementar CI/CD para tests automáticos
- [ ] Documentar variables de entorno en .env.example
- [ ] Agregar tests para acciones compartidas
- [ ] Considerar extraer `/lib` a un paquete npm privado

---

## 📚 Ver También

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía completa de deployment
- [ARCHITECTURE_FLOWS.md](ARCHITECTURE_FLOWS.md) - Flujos de la aplicación
- [README.md](README.md) - Documentación general
