# Clínica Landing - Sitio Público

Aplicación Next.js para la interfaz pública de pacientes.

## 🚀 Inicio rápido

```bash
cd clinica-landing
npm install
npm run dev
```

La aplicación se ejecutará en **http://localhost:3001** (si el puerto 3000 está ocupado).

## 📂 Estructura de directorios

```
clinica-landing/
├── app/
│   └── (public)/
│       └── turnos/
│           ├── page.tsx              # 🏠 Menú principal (2 opciones)
│           ├── mis-turnos/           # Ver turnos existentes por email/DNI
│           └── solicitar/            # 🔄 Flujo de 4 pasos
│               ├── page.tsx          # Paso 1: Datos + Obra Social
│               ├── especialidad/     # Paso 2: Elegir especialidad
│               ├── profesionales/    # Paso 3: Elegir médico
│               └── horario/          # Paso 4: Fecha/hora + Submit
│
└── lib/
    └── actions/
        └── turnos-queries.ts         # Queries de lectura (NO crea turnos)
```

## 🔄 Flujo de solicitud de turno

### **Paso 1: Datos básicos + Obra Social** (`/turnos/solicitar`)
- Usuario ingresa: nombre, email
- Selecciona obra social
- ✅ Server Action: `handlePaso1` valida y redirige

### **Paso 2: Especialidad** (`/turnos/solicitar/especialidad`)
- Muestra especialidades donde hay médicos con esa obra social
- ✅ Función: `listEspecialidadesPorObraSocial(obraSocialId)`
- Redirige al paso 3 con especialidadId

### **Paso 3: Profesional** (`/turnos/solicitar/profesionales`)
- Muestra médicos filtrados por obra social + especialidad
- ✅ Función: `listProfesionalesPorObraSocialYEspecialidad()`
- Redirige al paso 4 con profesionalId

### **Paso 4: Fecha y hora** (`/turnos/solicitar/horario`)
- Usuario elige fecha y hora
- ✅ Server Action: `handleSubmitTurno` crea el turno en la DB
- **IMPORTANTE:** Usa `crearTurno()` de `../../../lib/actions/turnos.ts` (raíz)
- Redirige a `/turnos/confirmacion?codigo=XXX`

## 🔗 Integración con la raíz

### **Imports desde la raíz**
Los archivos de `clinica-landing/` importan recursos compartidos:

```typescript
// ✅ Correcto: 3 niveles arriba para salir de clinica-landing
import { prisma } from "../../../lib/db/prisma";
import { crearTurno } from "../../../../../lib/actions/turnos";
```

### **Base de datos compartida**
- Usa `prisma/schema.prisma` de la raíz
- Comparte `lib/db/prisma.ts` (cliente singleton)
- Las migraciones se ejecutan desde la raíz

### **Diferencias clave**

| Aspecto | Raíz (Admin) | Landing (Público) |
|---------|--------------|-------------------|
| Puerto | 3000 | 3001 |
| Rutas API | ✅ `/turnos/[codigo]/download` | ❌ Solo Server Actions |
| Crear turnos | `lib/actions/turnos.ts` | Importa `crearTurno()` de raíz |
| Queries | `lib/queries/` | `lib/actions/turnos-queries.ts` |
| Autenticación | ✅ Clerk (admin) | ❌ Sin auth (público) |

## 📋 Server Actions disponibles

### `lib/actions/turnos-queries.ts` (landing)
```typescript
// Solo lectura - NO crea turnos
listObrasSociales()                     // Todas las obras sociales activas
listEspecialidadesPorObraSocial(id)     // Especialidades disponibles
listProfesionalesPorObraSocialYEspecialidad(obraId, especId)
```

### `lib/actions/turnos.ts` (raíz - importada)
```typescript
// Operaciones de escritura
crearTurno(data)              // Crea turno con validaciones
cancelarTurno(input)          // Cancela turno
reprogramarTurno(input)       // Reprograma turno
```

## ⚙️ Configuración

### Variables de entorno
Usa `.env` de la raíz (compartido):
```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_URL="http://localhost:3001"
```

### Scripts disponibles
```bash
npm run dev          # Desarrollo (puerto 3001)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
```

## 🎨 Estilos
- Tailwind CSS con variables CSS personalizadas
- `--brand-500`: Color principal (#4bbde3)
- Gradientes y efectos glassmorphism

## 📝 Notas importantes

1. **No ejecutar migraciones desde aquí:** Las migraciones de Prisma se ejecutan desde la raíz
2. **No instalar Prisma aquí:** Usa `@prisma/client` de la raíz
3. **DNI pendiente:** El flujo actual no solicita DNI (TODO)
4. **Slots horarios:** Aún no se validan slots disponibles del médico
