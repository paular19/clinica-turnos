# Flujo de Integración: Dashboard Médicos ↔ Dashboard Admin

## Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE CLÍNICA                       │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↓
    ┌────────────────┐              ┌──────────────────┐
    │  MÉDICOS       │              │  ADMINISTRADOR   │
    │  DASHBOARD     │              │  DASHBOARD       │
    └────────────────┘              └──────────────────┘
         ↓                                    ↑
    ┌─────────────────────────────────────────────────┐
    │                  SERVIDOR (Next.js)             │
    │                                                 │
    │  • Server Actions (marcar asistencia/ausencia) │
    │  • Revalidación de rutas                       │
    │  • Sincronización en BD                        │
    └─────────────────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────────────────┐
    │              BASE DE DATOS (PostgreSQL)         │
    │                                                 │
    │  Tabla: Turno                                  │
    │  - id, fecha, estado, pacienteId, etc         │
    │                                                 │
    │  Estados: PENDIENTE, CONFIRMADO, ASISTIDO,    │
    │           RETRASADO, AUSENCIA, CANCELADO      │
    └─────────────────────────────────────────────────┘
```

## Flujo de Cambio de Estado de Turno

### 1. Médico marca turno como ASISTIDO

```
Médico Dashboard                    Backend                      Base de Datos
      │                              │                               │
      ├──> Click botón ✓ ────────────>│                              │
      │                        marcarAsistido()                       │
      │                              │                               │
      │                        1. Autenticación                      │
      │                        2. Validación                          │
      │                        3. Update turno ─────────────>│
      │                              │                 estado = ASISTIDO
      │                        4. Revalidate paths ─────────>│
      │                              │       (refresca caché)
      │                              │                               │
      │<─── router.refresh() ────────│                              │
      │     (actualiza vista)         │                               │
      │                              │                               │
      └─> Admin Dashboard puede ver cambio (próximo reload)
         o en tiempo real si están sincronizados
```

### 2. Médico marca turno como AUSENCIA

```
Médico Dashboard                    Backend                      Base de Datos
      │                              │                               │
      ├──> Click botón ✕ ────────────>│                              │
      │                        marcarAusencia()                       │
      │                              │                               │
      │                        1. Validar permiso                     │
      │                        2. Verificar estado                    │
      │                        3. Update turno ─────────────>│
      │                              │                 estado = AUSENCIA
      │                        4. Revalidate ────────────────>│
      │                              │       (caché invalidado)
      │                              │                               │
      │<─── router.refresh() ────────│                              │
      │     (Tabla actualizada)       │                               │
      │                              │                               │
      └─> Admin Dashboard puede ver marcada como AUSENCIA
```

## Flujo Completo de Una Sesión Diaria

```
INICIO DEL DÍA
    │
    ├─> Médico inicia sesión
    │   • Clerk autentica usuario
    │   • Se obtiene profesional asociado
    │
    ├─> Accede a /medicos
    │   • Dashboard muestra datos de HOY
    │   • Vista resumen (5 tarjetas estadísticas)
    │   • Total de turnos, asistidos, etc.
    │
    ├─> Accede a /medicos/turnos
    │   • Lista completa de turnos del día
    │   • Ordenados por hora
    │   • Información del paciente
    │
DURANTE EL DÍA (turnos continuos)
    │
    ├─> Paciente llega a horario
    │   └─> Médico: Click ✓ (Marcar ASISTIDO)
    │       • Estado: CONFIRMADO → ASISTIDO
    │       • Base de datos actualizada
    │       • Admin ve cambio
    │
    ├─> Paciente llega tarde
    │   └─> Médico: Click ⏱ (Marcar RETRASADO)
    │       • Estado: CONFIRMADO → RETRASADO
    │       • Luego click ✓ (Marcar ASISTIDO)
    │       • Estado: RETRASADO → ASISTIDO
    │       • Admin ve retraso
    │
    ├─> Paciente no llega
    │   └─> Médico: Click ✕ (Marcar AUSENCIA)
    │       • Estado: CONFIRMADO → AUSENCIA
    │       • Se registra ausencia
    │       • Admin ve inasistencia
    │
FIN DEL DÍA
    │
    ├─> Reportes disponibles
    │   • Admin puede ver resumen del día
    │   • Ausencias por médico
    │   • Retrasos registrados
    │   • Tasa de asistencia
    │
    └─> Datos sincronizados y listos para reportes
```

## Server Actions Implementadas

### `marcarAsistido(turnoId: string)`
```typescript
Validaciones:
├─> Usuario autenticado con Clerk
├─> Usuario tiene profesional asociado
├─> Turno pertenece a este médico
└─> Actualiza estado a ASISTIDO

Revalidación:
└─> revalidatePath('/medicos/turnos')
    └─> Invalida caché, próxima carga obtiene datos frescos
```

### `marcarRetrasado(turnoId: string)`
```typescript
Validaciones:
├─> Usuario autenticado
├─> Turno pertenece a este médico
└─> Estado puede ser CONFIRMADO o PENDIENTE

Actualiza:
└─> estado = RETRASADO
```

### `marcarAusencia(turnoId: string)`
```typescript
Validaciones:
├─> Usuario autenticado
├─> Turno pertenece a este médico
└─> Cambio permitido desde CONFIRMADO, PENDIENTE o RETRASADO

Actualiza:
└─> estado = AUSENCIA
```

## Sincronización Automática

### Trigger de Actualización
```
1. Médico ejecuta server action
   ↓
2. Prisma actualiza BD
   ↓
3. revalidatePath() invalida caché
   ↓
4. Próxima solicitud obtiene datos frescos
   ↓
5. Admin Dashboard puede leer datos actualizados
```

### Vista en Tiempo Real

Para que admin vea cambios en tiempo real (sin refrescar):
- Implementar WebSocket o Server-Sent Events
- Actualmente: requiere refrescar página admin

### Caché Strategy

```
Request Flow:
│
├─> Primer request
│   ├─> Consulta BD
│   ├─> Cachea resultado
│   └─> Devuelve data
│
├─> Siguiente request (misma ruta)
│   ├─> Usa caché
│   └─> Devuelve rápido
│
├─> Server action ejecutado
│   ├─> Actualiza BD
│   ├─> Llama revalidatePath()
│   └─> Invalida caché
│
└─> Siguiente request después de acción
    ├─> Caché está vacío
    ├─> Consulta BD nuevamente
    └─> Obtiene datos actualizados
```

## Información Compartida entre Dashboards

### Datos Disponibles para Admin

```
Para cada turno del médico:
├─> Información del paciente
│   ├─> Nombre, apellido, DNI
│   ├─> Email, teléfono
│   └─> Obra social
├─> Información del turno
│   ├─> Fecha y hora
│   ├─> Estado actual (con timestamp)
│   ├─> Especialidad
│   └─> Motivo de consulta
└─> Estadísticas del día
    ├─> Total turnos por médico
    ├─> Tasa de asistencia
    ├─> Retrasos registrados
    └─> Ausencias
```

### Dashboard Admin - Sección de Asistencia

```
┌─────────────────────────────────────────────┐
│     ASISTENCIA DE MÉDICOS - TURNOS HOY     │
├─────────────────────────────────────────────┤
│                                             │
│  Filtros:                                  │
│  ├─ Médico: [dropdown]                     │
│  ├─ Fecha: [date picker]                   │
│  └─ Estado: [ASISTIDO/AUSENCIA/RETRASADO] │
│                                             │
│  Estadísticas:                             │
│  ├─ Dr. Juan García: 8 turnos, 7 asistieron (87.5%) │
│  ├─ Dra. María López: 6 turnos, 5 asistieron (83.3%) │
│  └─ Dr. Carlos Ruiz: 10 turnos, 9 asistieron (90%)  │
│                                             │
│  Tabla de Turnos:                          │
│  ├─ Hora | Médico | Paciente | Estado | Acción │
│  ├─ 09:00 | García | Juan P. | ✓ Asistido | - │
│  ├─ 09:30 | García | María S. | ⏱ Retrasado | - │
│  └─ 10:00 | García | Carlos M. | ✕ Ausencia | - │
│                                             │
└─────────────────────────────────────────────┘
```

## Secuencia de Eventos Típica

```
T1: 09:00 - Médico García accede a dashboard
    → Query: getTurnosMedicoHoy() → 8 turnos
    → Estadísticas: todas CONFIRMADO

T2: 09:05 - Primer paciente García, Paciente 1
    → Médico: Click ✓
    → marcarAsistido(turno1)
    → BD: turno1.estado = ASISTIDO
    → Caché invalida
    → Admin recarga: ve García con 1 asistido

T3: 09:35 - Tercer paciente García, Paciente 3 retrasado
    → Médico: Click ⏱
    → marcarRetrasado(turno3)
    → BD: turno3.estado = RETRASADO
    → Admin ve: García con 1 retraso registrado

T4: 09:40 - Paciente 3 llega
    → Médico: Click ✓
    → marcarAsistido(turno3)
    → BD: turno3.estado = ASISTIDO
    → Admin ve: García con retraso pasado a asistido

T5: 10:45 - Paciente 6 no llega
    → Médico: Click ✕
    → marcarAusencia(turno6)
    → BD: turno6.estado = AUSENCIA
    → Admin ve: García con 1 ausencia registrada

T6: 13:00 - Fin de turnos
    → Admin genera reporte
    → García: 8 turnos, 7 asistieron (1 ausencia), 1 retraso registrado
```

## Consideraciones de Seguridad

```
Authentication Flow:
    User Login (Clerk)
         ↓
    Middleware verifica token
         ↓
    Acceso a ruta protegida (/medicos/*)
         ↓
    Server Action verifica userId
         ↓
    Consulta obtiene profesional del usuario
         ↓
    Validación: turno pertenece a este profesional
         ↓
    ✓ Acción permitida
    ✗ Error de autorización

Authorization:
    • Solo el médico asignado puede cambiar estado
    • Admin no puede cambiar estado por médico
    • Cada operación registra timestamp
    • Base de datos mantiene integridad
```

## Flujo de Datos en Diagrama

```
                    ┌──────────────────┐
                    │  Médico Inicia   │
                    │  Sesión (Clerk)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ /medicos/page.tsx│
                    │ (Dashboard)      │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────────┐
                    │ getTurnosMedicoHoy()  │
                    │ getTurnosMedicoResumen│
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ BD: SELECT turnos    │
                    │ WHERE profesionalId= │
                    │ AND fecha = TODAY    │
                    └────────┬──────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        │                    │                     │
   ┌────▼──────┐        ┌────▼──────┐        ┌────▼──────┐
   │ Total: 8  │        │ Asistidos │        │ Retrasados│
   └───────────┘        │  Ausencias│        │  Pendiente│
                        └───────────┘        └───────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ /medicos/turnos  │
                    │ (Lista detallada)│
                    └────────┬─────────┘
                             │
                             ├──> Médico ve turno: CONFIRMADO
                             │
                             ├──> Click ✓ Asistido
                             │    ↓
                             ├──> marcarAsistido()
                             │    ↓
                             ├──> Update BD: ASISTIDO
                             │    ↓
                             ├──> revalidatePath()
                             │    ↓
                             ├──> router.refresh()
                             │    ↓
                             ├──> Tabla actualizada
                             │    ↓
                             └──> Admin ve cambio (próximo refresh)
```

## Beneficios del Sistema

✅ **Para Médicos:**
- Interface simple y directa
- Marcar asistencia en segundos
- Información completa del paciente
- Sincronización automática

✅ **Para Administrador:**
- Visión en tiempo real de asistencias
- Reportes de ausencias
- Seguimiento de retrasos
- Datos sincronizados desde la fuente

✅ **Para la Clínica:**
- Mejor gestión de turnos
- Registro de inasistencias
- Análisis de patrones
- Base de datos actualizada

## Próximas Optimizaciones

1. **WebSocket para tiempo real**
   - Admin ve cambios sin refrescar
   - Notificaciones en vivo

2. **Validación de horario**
   - Médico solo puede marcar después de la hora
   - Evitar cambios prematuro de estado

3. **Auditoría completa**
   - Registrar quién cambió qué y cuándo
   - Histórico completo de cambios

4. **Exportación de reportes**
   - Excel con estadísticas diarias
   - PDF con certificados de asistencia

5. **Notificaciones automáticas**
   - Alert al admin de ausencias
   - Email a pacientes ausentes
