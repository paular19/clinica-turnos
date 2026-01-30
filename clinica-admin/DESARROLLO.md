# 📚 Guía de Desarrollo - Panel de Administración

## 🏗️ Arquitectura

### Estructura de Carpetas

```
app/
├── dashboard/           # Rutas protegidas del dashboard
│   ├── layout.tsx      # Layout con sidebar y header
│   ├── page.tsx        # Dashboard principal
│   ├── profesionales/  # Módulo de profesionales
│   ├── obras-sociales/ # Módulo de obras sociales
│   ├── horarios/       # Módulo de horarios
│   └── turnos/         # Módulo de turnos
├── sign-in/            # Autenticación
├── sign-up/            # Registro
├── components/         # Componentes reutilizables
└── layout.tsx          # Layout raíz con ClerkProvider

lib/
├── actions/            # Server Actions
│   ├── admin.ts       # CRUD de profesionales, obras sociales, horarios
│   └── turnos.ts      # CRUD de turnos
├── db/
│   └── prisma.ts      # Cliente de Prisma
└── queries/           # Queries de base de datos (opcional)
```

### Patrón de Diseño

1. **Server Components por defecto**: Las páginas son Server Components para mejor SEO y performance
2. **Client Components selectivos**: Usar `'use client'` solo cuando sea necesario (formularios, interactividad)
3. **Server Actions**: Para mutaciones de datos (`createProfesional`, `updateTurno`, etc.)
4. **Middleware**: Clerk middleware protege las rutas del dashboard

## 🔐 Autenticación

### Clerk Integration

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

### Obtener Usuario Actual

```typescript
// En Server Component
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();

// En Server Action
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();
```

## 💾 Base de Datos

### Prisma Client

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Queries Comunes

```typescript
// Obtener datos con relaciones
const profesional = await prisma.profesional.findUnique({
  where: { id },
  include: {
    especialidades: true,
    obraSociales: {
      include: {
        obraSocial: true,
      },
    },
  },
});

// Crear con relaciones
await prisma.profesional.create({
  data: {
    nombre: 'Dr. Juan Pérez',
    clinicId: usuario.clinicId,
    especialidades: {
      connect: especialidadIds.map(id => ({ id })),
    },
  },
});
```

## 🎨 Componentes UI

### Componentes Creados

#### SearchBar
Barra de búsqueda con debounce

```typescript
import SearchBar from '@/app/components/SearchBar';

<SearchBar 
  onSearch={(query) => console.log(query)}
  placeholder="Buscar profesionales..."
/>
```

#### Alert
Notificaciones con auto-close

```typescript
import Alert from '@/app/components/Alert';

<Alert 
  type="success"
  message="Profesional creado exitosamente"
  autoClose
/>
```

#### LoadingSpinner
Indicador de carga

```typescript
import LoadingSpinner from '@/app/components/LoadingSpinner';

<LoadingSpinner message="Cargando datos..." />
```

#### EmptyState
Estado vacío con acción

```typescript
import EmptyState from '@/app/components/EmptyState';

<EmptyState
  title="No hay profesionales"
  description="Comienza creando tu primer profesional"
  action={{
    label: 'Crear Profesional',
    onClick: () => router.push('/dashboard/profesionales/nuevo')
  }}
/>
```

## 🚀 Server Actions

### Patrón de Server Action

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '../db/prisma';

export async function createProfesional(data: FormData) {
  // 1. Autenticación
  const { userId } = await auth();
  if (!userId) throw new Error('No autorizado');

  // 2. Obtener clinicId del usuario
  const usuario = await prisma.usuario.findUnique({
    where: { clerkId: userId },
  });

  if (!usuario) throw new Error('Usuario no encontrado');

  // 3. Operación de base de datos
  const profesional = await prisma.profesional.create({
    data: {
      nombre: data.nombre,
      clinicId: usuario.clinicId,
    },
  });

  // 4. Revalidar cache
  revalidatePath('/dashboard/profesionales');

  // 5. Retornar resultado
  return profesional;
}
```

### Manejo de Errores

```typescript
// En el componente
try {
  await createProfesional(formData);
  router.push('/dashboard/profesionales');
} catch (error) {
  console.error(error);
  alert('Error al crear el profesional');
}
```

## 📋 Formularios

### Patrón de Formulario

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MiFormulario() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await miServerAction(formData);
      router.push('/dashboard/mi-seccion');
      router.refresh(); // Refresca los datos
    } catch (error) {
      alert('Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
```

## 🎯 Mejores Prácticas

### 1. Performance

- Usa Server Components cuando sea posible
- Implementa paginación para listas grandes
- Usa `revalidatePath` después de mutaciones

### 2. UX

- Muestra estados de carga (`isSubmitting`, `isLoading`)
- Deshabilita botones durante operaciones
- Muestra mensajes de confirmación
- Usa estados vacíos informativos

### 3. Seguridad

- Siempre valida la autenticación en Server Actions
- Verifica que el usuario pertenece a la clínica correcta
- Sanitiza inputs del usuario
- Usa prepared statements (Prisma lo hace automáticamente)

### 4. Código Limpio

- Nombres descriptivos para funciones y variables
- Componentes pequeños y reutilizables
- Separar lógica de negocio en Server Actions
- Comentarios solo cuando sea necesario

## 🔄 Flujo de Datos

```
Usuario → Formulario (Client Component)
    ↓
Server Action
    ↓
Validación + Autenticación
    ↓
Prisma Query
    ↓
Revalidate Path
    ↓
Response → Redirect → Refresh
```

## 📝 Agregar Nueva Funcionalidad

### Checklist

1. [ ] Crear Server Action en `lib/actions/`
2. [ ] Crear página en `app/dashboard/mi-seccion/page.tsx`
3. [ ] Crear formulario (si es necesario)
4. [ ] Agregar enlace en el sidebar (`app/dashboard/layout.tsx`)
5. [ ] Agregar validaciones
6. [ ] Probar funcionalidad
7. [ ] Documentar en README

### Ejemplo: Agregar "Pacientes"

```typescript
// 1. lib/actions/pacientes.ts
'use server';
export async function createPaciente(data) { /* ... */ }

// 2. app/dashboard/pacientes/page.tsx
export default async function PacientesPage() { /* ... */ }

// 3. app/dashboard/pacientes/PacienteForm.tsx
'use client';
export default function PacienteForm() { /* ... */ }

// 4. Actualizar app/dashboard/layout.tsx
<NavLink href="/dashboard/pacientes" icon={<Users />}>
  Pacientes
</NavLink>
```

## 🧪 Testing (Futuro)

Considera agregar:
- Unit tests para Server Actions
- Integration tests para flujos completos
- E2E tests con Playwright

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

¡Happy Coding! 🚀
