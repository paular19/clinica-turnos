# 📁 Distribución de Archivos - Admin vs Landing

## ✅ Corrección Aplicada

Se eliminó la carpeta `(public)` de `clinica-admin` porque todo el contenido público pertenece a `clinica-landing`.

---

## 🏥 clinica-admin (Sistema Administrativo)

**Contenido actual:**
```
clinica-admin/app/
├── layout.tsx          # Layout principal admin
├── not-found.tsx       # Página 404
└── globals.css         # Estilos globales
```

**Contenido que falta agregar (Dashboard Admin):**
```
clinica-admin/app/
├── (auth)/             # Rutas de autenticación (Clerk)
│   ├── sign-in/
│   └── sign-up/
│
├── (dashboard)/        # Rutas del dashboard admin
│   ├── admin/          # Panel de administrador
│   │   ├── profesionales/
│   │   ├── especialidades/
│   │   ├── turnos/
│   │   └── pacientes/
│   │
│   ├── medico/         # Panel de médico
│   │   ├── mis-turnos/
│   │   └── horarios/
│   │
│   └── paciente/       # Panel de paciente (si aplica)
│       └── mis-turnos/
│
└── api/                # API routes (si necesarias)
```

---

## 🌐 clinica-landing (Sitio Público)

**Contenido actual:**
```
clinica-landing/app/
├── layout.tsx
├── (public)/
│   ├── layout.tsx
│   ├── page.tsx                      # Home landing
│   └── turnos/                       # Sección pública de turnos
│       ├── page.tsx                  # Hub de turnos
│       ├── layout.tsx
│       ├── [codigo]/                 # Ver turno por código
│       │   ├── page.tsx
│       │   └── download/route.ts     # Descargar PDF
│       ├── confirmacion/             # Confirmación de turno
│       │   └── page.tsx
│       ├── export/route.ts           # Exportar turnos
│       ├── mis-turnos/               # Consultar mis turnos
│       │   └── page.tsx
│       └── solicitar/                # Solicitar turno nuevo
│           ├── page.tsx
│           ├── especialidad/
│           │   └── page.tsx
│           ├── horario/
│           │   └── page.tsx
│           └── profesionales/
│               └── page.tsx
│
├── components/          # Componentes UI landing
│   ├── public/
│   └── ui/
│
└── lib/
    └── actions/
        └── mis-turnos-actions.ts
```

---

## 📦 Archivos Compartidos (Root)

```
lib/                    # Lógica compartida
├── actions/
│   ├── serverAdmin.ts   # Acciones admin
│   ├── serverTurnos.ts  # Acciones de turnos
│   └── index.ts
├── queries/             # Database queries
├── email/               # Email templates
├── pdf/                 # PDF generation
├── db/prisma.ts         # Prisma client
└── zod/schemas.ts       # Validaciones

prisma/                  # Database
├── schema.prisma
└── migrations/
```

---

## 🎯 Responsabilidades por Proyecto

### clinica-admin
- ✅ Autenticación con Clerk
- ✅ Dashboard administrativo
- ✅ Gestión de profesionales, especialidades, pacientes
- ✅ Creación y gestión de turnos (admin)
- ✅ Reportes y estadísticas

### clinica-landing
- ✅ Página de inicio (landing page)
- ✅ Solicitud de turnos (flujo público)
- ✅ Consulta de turnos por código
- ✅ Cancelación de turnos (con validación 12hs)
- ✅ Descarga de comprobantes PDF
- ✅ Información de la clínica

---

## 🔄 Próximos Pasos

### 1. Agregar rutas de admin en clinica-admin

El proyecto `clinica-admin` necesita las rutas del dashboard. Podés:

**Opción A: Crear desde cero**
```bash
cd clinica-admin/app
mkdir -p (auth)/sign-in (auth)/sign-up
mkdir -p (dashboard)/admin
```

**Opción B: Si ya tenías estas rutas en otro lugar, copiarlas**

### 2. Verificar imports

Asegurate de que todos los imports usen el alias correcto:
```typescript
// ✅ Correcto
import { prisma } from "@/lib/db/prisma"

// ❌ Incorrecto
import { prisma } from "../../lib/db/prisma"
```

### 3. Limpiar archivos del root

El directorio `/app` en el root ahora solo contiene archivos que ya están en clinica-landing o clinica-admin. Podés eliminarlo:

```bash
cd C:\Users\ramos\OneDrive\Desktop\clinica-turnos
Remove-Item -Path "app" -Recurse -Force
```

---

## ✅ Estado Actual

- ✅ `clinica-admin/app/(public)` eliminada (no pertenece ahí)
- ✅ `clinica-landing/app/(public)` contiene todo el contenido público
- ✅ Archivos compartidos en `/lib` y `/prisma`
- ⏳ Pendiente: Agregar rutas de dashboard en clinica-admin

---

## 🔗 Estructura Correcta Final

```
clinica-turnos/
│
├── lib/                          # Compartido
├── prisma/                       # Compartido
│
├── clinica-admin/                # Solo admin
│   └── app/
│       ├── (auth)/              # Login admin
│       ├── (dashboard)/         # Dashboard admin
│       └── layout.tsx
│
└── clinica-landing/             # Solo público
    └── app/
        └── (public)/            # Todo el contenido público
            ├── page.tsx         # Home
            └── turnos/          # Turnos públicos
```

¡Ahora la separación es correcta! 🎉
