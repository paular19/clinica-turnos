# 🗺️ Mapa de Rutas - Panel de Administración

## 🔓 Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Redirecciona a `/dashboard` |
| `/sign-in` | Página de inicio de sesión (Clerk) |
| `/sign-up` | Página de registro (Clerk) |

## 🔐 Rutas Protegidas (Dashboard)

### Dashboard Principal

| Ruta | Descripción | Componentes |
|------|-------------|-------------|
| `/dashboard` | Vista general con estadísticas | Dashboard con tarjetas de resumen |

### Profesionales

| Ruta | Descripción | Acciones |
|------|-------------|----------|
| `/dashboard/profesionales` | Lista de todos los profesionales | Ver, Editar, Eliminar |
| `/dashboard/profesionales/nuevo` | Formulario para crear profesional | Crear |
| `/dashboard/profesionales/[id]/editar` | Formulario para editar profesional | Actualizar |

**Datos mostrados:**
- Nombre y matrícula
- Especialidades asignadas
- Cantidad de obras sociales vinculadas
- Cantidad de turnos
- Cantidad de horarios configurados

### Obras Sociales

| Ruta | Descripción | Acciones |
|------|-------------|----------|
| `/dashboard/obras-sociales` | Grid de obras sociales | Ver, Editar, Eliminar, Gestionar Profesionales |
| `/dashboard/obras-sociales/nueva` | Formulario para crear obra social | Crear |
| `/dashboard/obras-sociales/[id]/editar` | Formulario para editar obra social | Actualizar |
| `/dashboard/obras-sociales/[id]/profesionales` | Gestionar vinculación con profesionales | Vincular, Desvincular |

**Datos mostrados:**
- Nombre
- Estado (Activa/Inactiva)
- Cantidad de pacientes
- Cantidad de profesionales vinculados

### Horarios

| Ruta | Descripción | Acciones |
|------|-------------|----------|
| `/dashboard/horarios` | Horarios agrupados por profesional | Ver, Editar, Eliminar |
| `/dashboard/horarios/nuevo` | Formulario para crear horario | Crear |
| `/dashboard/horarios/[id]/editar` | Formulario para editar horario | Actualizar |

**Datos mostrados:**
- Profesional
- Día de la semana
- Horario de inicio y fin
- Intervalo entre turnos

### Turnos

| Ruta | Descripción | Acciones |
|------|-------------|----------|
| `/dashboard/turnos` | Tabla de todos los turnos con filtros | Ver, Confirmar, Cancelar, Marcar Asistido |
| `/dashboard/turnos/nuevo` | Formulario para crear turno | Crear |

**Filtros disponibles:**
- Por profesional
- Por estado (Pendiente, Confirmado, Asistido, Cancelado, Reprogramado)

**Datos mostrados:**
- Fecha y hora
- Paciente (nombre, DNI)
- Profesional
- Especialidad
- Estado
- Código del turno

## 📋 Server Actions

### Admin Actions (`lib/actions/admin.ts`)

#### Profesionales
```typescript
createProfesional(data: { nombre, matricula?, especialidadIds })
updateProfesional(id, data: { nombre, matricula?, especialidadIds })
deleteProfesional(id)
```

#### Obras Sociales
```typescript
createObraSocial(data: { nombre, activa })
updateObraSocial(id, data: { nombre, activa })
deleteObraSocial(id)
```

#### Vinculación Obra Social - Profesional
```typescript
vincularObraSocial(profesionalId, obraSocialId)
desvincularObraSocial(profesionalId, obraSocialId)
```

#### Horarios
```typescript
createHorario(data: { profesionalId, diaSemana, horaInicio, horaFin, intervaloMin })
updateHorario(id, data: { diaSemana, horaInicio, horaFin, intervaloMin })
deleteHorario(id)
```

### Turnos Actions (`lib/actions/turnos.ts`)

```typescript
getTurnosByProfesional(profesionalId)
createTurno(data: { fecha, pacienteId, profesionalId, especialidadId, motivo? })
cancelarTurno(id, motivo?)
confirmarTurno(id)
marcarAsistido(id)
```

## 🎨 Componentes Reutilizables

| Componente | Ubicación | Uso |
|------------|-----------|-----|
| SearchBar | `app/components/SearchBar.tsx` | Búsqueda con debounce |
| Alert | `app/components/Alert.tsx` | Notificaciones |
| LoadingSpinner | `app/components/LoadingSpinner.tsx` | Estado de carga |
| EmptyState | `app/components/EmptyState.tsx` | Estado vacío |

## 🔄 Estados de Turno

```typescript
enum TurnoEstado {
  PENDIENTE    // Turno creado, esperando confirmación
  CONFIRMADO   // Turno confirmado por el sistema/paciente
  ASISTIDO     // Paciente asistió a la consulta
  CANCELADO    // Turno cancelado
  REPROGRAMADO // Turno reprogramado (futuro)
}
```

### Flujo de Estados

```
PENDIENTE → CONFIRMADO → ASISTIDO
    ↓           ↓
CANCELADO   CANCELADO
```

## 📊 Permisos por Rol

| Rol | Acceso |
|-----|--------|
| ADMIN | Acceso completo a todas las funcionalidades |
| MEDICO | (Futuro) Acceso limitado a sus propios turnos |

## 🔔 Notificaciones

### Acciones que Revalidan Cache

Todas las acciones de creación, actualización y eliminación llaman a `revalidatePath()` para actualizar la UI:

- `revalidatePath('/dashboard/profesionales')`
- `revalidatePath('/dashboard/obras-sociales')`
- `revalidatePath('/dashboard/horarios')`
- `revalidatePath('/dashboard/turnos')`

## 🎯 Próximas Funcionalidades Sugeridas

- [ ] Gestión de Pacientes
- [ ] Gestión de Especialidades
- [ ] Reportes y Estadísticas
- [ ] Calendario visual de turnos
- [ ] Notificaciones por email/SMS
- [ ] Exportación de datos a Excel/PDF
- [ ] Historial de cambios (audit log)
- [ ] Dashboard por profesional (rol MEDICO)
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Configuración de la clínica

## 🛠️ Utilidades

### Formateo de Fechas

El proyecto usa `date-fns` para manejo de fechas:

```typescript
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });
// "13 de enero de 2026"
```

### Iconos

Se usa `lucide-react` para iconos:

```typescript
import { Calendar, User, Settings } from 'lucide-react';

<Calendar size={20} className="text-blue-600" />
```

## 📱 Responsive Design

Todas las vistas están optimizadas para:
- 📱 Mobile (320px+)
- 💻 Tablet (768px+)
- 🖥️ Desktop (1024px+)

## 🔍 SEO

- Metadata configurado en cada `page.tsx`
- Server-side rendering por defecto
- URLs amigables y descriptivas

---

**Última actualización:** Enero 2026
