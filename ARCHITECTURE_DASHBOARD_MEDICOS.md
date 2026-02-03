# Arquitectura del Dashboard de Médicos

## Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│                     PLATAFORMA CLÍNICA                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐      ┌──────────────────────────────┐
│    PORTAL DEL MÉDICO         │      │    ADMIN PANEL               │
│        (/medicos)            │      │    (/dashboard)              │
└──────────────────────────────┘      └──────────────────────────────┘
         │                                      │
         ├─ Dashboard Principal                ├─ Dashboard Principal
         │  ├─ Bienvenida                      │  ├─ Estadísticas en vivo
         │  ├─ Info Profesional                │  ├─ Tabla turnos del día
         │  ├─ Resumen Hoy                     │  ├─ Gráficos
         │  └─ Acciones Rápidas                │  └─ Acciones Rápidas
         │
         └─ Gestión Turnos (/medicos/turnos)
            ├─ Lista turnos hoy
            ├─ Información paciente
            ├─ Botones de acción
            │  ├─ Marcar Asistido ✅
            │  ├─ Marcar Retrasado ⏱️
            │  └─ Marcar Ausencia ❌
            └─ Actualización en tiempo real
```

## Flujo de Datos

```
                    ┌─────────────────┐
                    │   CLERK AUTH    │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌──────▼──────┐           ┌──────▼──────┐
        │ Login Médico │           │ Login Admin  │
        └──────┬───────┘           └──────┬──────┘
               │                          │
        ┌──────▼─────────┐        ┌──────▼──────────┐
        │ /medicos/turnos │        │ /dashboard      │
        └──────┬──────────┘        └──────┬──────────┘
               │                          ▲
               │                          │
        ┌──────▼─────────────────────────┴──────┐
        │          PRISMA DATABASE               │
        │  ┌─────────────────────────────────┐  │
        │  │ TURNOS                          │  │
        │  ├─ id                             │  │
        │  ├─ fecha                          │  │
        │  ├─ estado (NUEVO: AUSENCIA)       │  │
        │  ├─ profesionalId                  │  │
        │  ├─ pacienteId                     │  │
        │  └─ ...                            │  │
        │  ┌─────────────────────────────────┐  │
        │  │ USUARIOS / PROFESIONALES        │  │
        │  └─────────────────────────────────┘  │
        └─────────────────────────────────────┘
```

## Estado del Turno - Ciclo de Vida

```
    ┌─────────────────────────────────────────────┐
    │          ESTADOS DEL TURNO                  │
    └─────────────────────────────────────────────┘

    PENDIENTE (amarillo)
        ↓
    CONFIRMADO (azul) ◄─────────────────────────┐
        ├─→ ASISTIDO ✅ (verde)                 │
        ├─→ RETRASADO ⏱️ (naranja)              │
        │    └─→ ASISTIDO (dentro turno)        │
        ├─→ AUSENCIA ❌ (rojo)                  │
        ├─→ REPROGRAMADO (púrpura)──────────────┘
        └─→ CANCELADO (gris)
```

## Componentes Frontend

### 1. Dashboard Médico (`/medicos`)
```tsx
<div>
  ├─ Header (Bienvenida + Fecha)
  ├─ Card Info Profesional
  │  ├─ Nombre, Matrícula
  │  ├─ Especialidades
  │  └─ Resumen Hoy (4 Cards)
  ├─ Acciones Rápidas (3 Links)
  │  ├─ Mis Turnos
  │  ├─ Horarios
  │  └─ Configuración
  └─ Nota Informativa
```

### 2. Gestión Turnos (`/medicos/turnos`)
```tsx
<div>
  ├─ Header (Turnos de Hoy)
  ├─ Estadísticas (4 Cards)
  │  ├─ Total Turnos
  │  ├─ Asistidos
  │  ├─ Retrasados
  │  └─ Ausencias
  └─ Tabla Turnos
     └─ TurnoMedicoActions (Botones)
        ├─ Check ✅ (Asistido)
        ├─ Clock ⏱️ (Retrasado)
        └─ X ❌ (Ausencia)
```

### 3. Dashboard Admin (`/dashboard`)
```tsx
<div>
  ├─ Header (Bienvenida Admin)
  ├─ Stats Cards (4)
  ├─ Resumen Asistencias (5 Cards)
  │  ├─ Total
  │  ├─ Asistidos
  │  ├─ Retrasados
  │  ├─ Ausencias
  │  └─ Confirmados
  └─ Tabla Turnos Hoy
     └─ Sync en tiempo real
```

## Server Actions (Acciones)

```
┌────────────────────────────────────────┐
│   lib/actions/medicos.ts               │
├────────────────────────────────────────┤
│                                        │
│ marcarAsistido(turnoId)                │
│  ├─ Validar Clerk Auth                 │
│  ├─ Verificar Profesional              │
│  ├─ Verificar Turno                    │
│  └─ UPDATE estado = ASISTIDO           │
│                                        │
│ marcarRetrasado(turnoId)               │
│  ├─ Validar Clerk Auth                 │
│  ├─ Verificar Profesional              │
│  ├─ Verificar Turno                    │
│  └─ UPDATE estado = RETRASADO          │
│                                        │
│ marcarAusencia(turnoId) [NUEVO]        │
│  ├─ Validar Clerk Auth                 │
│  ├─ Verificar Profesional              │
│  ├─ Verificar Turno                    │
│  └─ UPDATE estado = AUSENCIA           │
│                                        │
└────────────────────────────────────────┘
         ↓ revalidatePath()
     Refrescar datos en BD
```

## Database Queries

```
┌────────────────────────────────────────┐
│   lib/queries/turnos.ts                │
├────────────────────────────────────────┤
│                                        │
│ getTurnosMedicoHoy(profesionalId)      │
│  └─ SELECT * FROM Turno WHERE:         │
│     - profesionalId                    │
│     - fecha entre HOY 00:00 - 23:59   │
│     - INCLUDE paciente, especialidad   │
│     - ORDER BY fecha ASC               │
│                                        │
│ getTurnosMedicoResumen(profesionalId)  │
│  └─ SELECT COUNT(*) GROUP BY estado    │
│     - total, confirmados, asistidos... │
│                                        │
└────────────────────────────────────────┘
```

## Middleware & Routing

```
Clerk Middleware
    ├─ Rutas Públicas
    │  ├─ /sign-in
    │  └─ /sign-up
    │
    └─ Rutas Protegidas
       ├─ /medicos/* (Requiere MEDICO)
       └─ /dashboard/* (Requiere ADMIN)
```

## Sincronización Admin ← Médico

```
MÉDICO REALIZA ACCIÓN
        ↓
marcarAsistido() / marcarRetrasado() / marcarAusencia()
        ↓
UPDATE en Prisma/PostgreSQL
        ↓
revalidatePath() - Invalida caché
        ↓
ADMIN VE CAMBIOS (próxima carga)
        ↓
/dashboard muestra datos actualizados
```

## Tabla de Responsabilidades

| Componente | Médico | Admin |
|-----------|--------|-------|
| Ver propios turnos | ✅ | ❌ |
| Ver todos los turnos | ❌ | ✅ |
| Marcar asistencia | ✅ | ❌ |
| Crear turnos | ❌ | ✅ |
| Ver estadísticas | ✅ | ✅ |
| Modificar turnos otros | ❌ | ✅ |

## Colores y Estados

| Estado | Color | Icono | Acción |
|--------|-------|-------|--------|
| PENDIENTE | Amarillo | - | - |
| CONFIRMADO | Azul | 📅 | Asistido / Retrasado |
| ASISTIDO | Verde | ✅ | - |
| RETRASADO | Naranja | ⏱️ | Asistido |
| AUSENCIA | Rojo | ❌ | - |
| CANCELADO | Gris | 🚫 | - |

## Performance Optimizations

1. **Server-Side Rendering**: Datos obtenidos en servidor
2. **Query Optimization**: Índices en fecha, profesionalId, estado
3. **Caching**: revalidatePath() invalidación selectiva
4. **Lazy Loading**: Tablas paginadas si es necesario
5. **Parallel Queries**: Promise.all() para múltiples queries

## Seguridad

```
REQUEST
    ↓
Clerk Auth Middleware
    ├─ ¿Validar token?
    └─ ❌ → Redirect /sign-in
    ↓
Server Action / Query
    ├─ ¿Usuario existe en BD?
    ├─ ¿Tiene profesional asociado?
    ├─ ¿Es el dueño del turno?
    └─ ❌ → throw Error
    ↓
Database Update/Query
    └─ ✅ Return datos
```
