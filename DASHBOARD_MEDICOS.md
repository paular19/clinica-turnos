# Dashboard de Médicos - Documentación

## Descripción General

Se ha desarrollado un completo dashboard para médicos que permite gestionar turnos, marcar asistencia/ausencia de pacientes y sincronizar esta información automáticamente con el dashboard del administrador.

## Características Implementadas

### 1. **Autenticación y Autorización**
- Los médicos acceden través de Clerk con su usuario
- Solo médicos con rol `MEDICO` pueden acceder al dashboard
- Validación de que el usuario tenga un perfil profesional asociado

### 2. **Dashboard Principal de Médicos** (`/medicos`)
Muestra:
- Bienvenida personalizada con nombre del médico
- Fecha y día actual
- Información profesional (nombre, matrícula, especialidades)
- Resumen rápido de turnos del día:
  - Total de turnos
  - Asistidos
  - Confirmados
  - Retrasados
- Acciones rápidas:
  - Mis Turnos
  - Horarios
  - Configuración

### 3. **Gestión de Turnos del Día** (`/medicos/turnos`)
Funcionalidades:
- **Visualización de turnos**: Solo muestra los turnos del día actual
- **Información completa del paciente**:
  - Nombre y apellido
  - DNI
  - Contacto (teléfono, email)
  - Obra social asociada
  - Especialidad del turno
- **Estados y estadísticas**:
  - Total de turnos del día
  - Turnos confirmados
  - Turnos asistidos
  - Turnos retrasados
  - Ausencias
- **Acciones disponibles**:
  - ✅ **Marcar como Asistido**: Paciente llegó a tiempo
  - ⏱️ **Marcar como Retrasado**: Paciente llegó tarde
  - ❌ **Marcar como Ausencia**: Paciente no asistió

### 4. **Estados de Turnos**
Se agregó un nuevo estado `AUSENCIA` al enum `TurnoEstado`:
```
PENDIENTE       - Turno pendiente de confirmación
CONFIRMADO      - Turno confirmado
ASISTIDO        - Paciente asistió
RETRASADO       - Paciente llegó tarde
AUSENCIA        - Paciente no asistió
CANCELADO       - Turno cancelado
REPROGRAMADO    - Turno reprogramado
```

### 5. **Dashboard del Administrador Mejorado** (`/dashboard`)
Ahora muestra:
- **Resumen de asistencias del día** con estadísticas en tiempo real:
  - Total de turnos
  - Asistidos
  - Retrasados
  - Ausencias
  - Confirmados
- **Tabla de turnos del día** con información actualizada
- Los cambios realizados por los médicos se sincronizan automáticamente

## Archivos Modificados

### Backend (Server Actions)
- **`lib/actions/medicos.ts`**: Agregadas acciones
  - `marcarAsistido()` - Marcar turno como asistido
  - `marcarRetrasado()` - Marcar turno como retrasado
  - `marcarAusencia()` - Marcar turno como ausencia (nuevo)

### Queries
- **`lib/queries/turnos.ts`**: Agregadas nuevas funciones
  - `getTurnosMedicoHoy()` - Obtener turnos del día del médico con detalles
  - `getTurnosMedicoResumen()` - Obtener estadísticas del día

### Frontend (Páginas y Componentes)
- **`app/medicos/page.tsx`**: Dashboard principal mejorado
- **`app/medicos/turnos/page.tsx`**: Gestión de turnos del día mejorada
- **`app/medicos/turnos/TurnoMedicoActions.tsx`**: Componente de acciones mejorado
- **`app/dashboard/page.tsx`**: Dashboard admin mejorado con estadísticas en tiempo real

### Base de Datos
- **`prisma/schema.prisma`**: 
  - Agregado estado `AUSENCIA` al enum `TurnoEstado`
  - Removida propiedad `url` del datasource (compatible con Prisma 7)

## Flujo de Datos

```
Médico accede a /medicos
        ↓
Ve resumen del día
        ↓
Accede a /medicos/turnos
        ↓
Ve tabla con turnos del día
        ↓
Marca asistencia/ausencia del paciente
        ↓
Se actualiza en tiempo real
        ↓
Admin ve cambios en /dashboard
```

## Seguridad

- Solo el médico asignado al turno puede modificar su estado
- Validación mediante Clerk authentication
- Verificación de permisos en cada acción
- Revalidación de datos después de cambios

## Sincronización en Tiempo Real

- Los cambios en turnos disparan `revalidatePath()` automáticamente
- El admin verá los cambios en la próxima carga del dashboard
- Los datos se obtienen directamente de la BD en cada request

## Próximas Mejoras (Opcionales)

1. Agregar WebSockets para actualización en tiempo real sin refrescar
2. Historial de cambios de asistencia
3. Reportes de asistencia por médico
4. Notificaciones a pacientes sobre cambios
5. Exportar reportes a PDF
6. Integración con SMS para avisar ausencias
7. Dashboard de estadísticas por período

## Migración de Base de Datos

Para aplicar los cambios a la base de datos:

```bash
cd clinica-admin
npx prisma migrate dev --name add_ausencia_estado
```

Nota: Si la BD está offline, la migración se aplicará cuando se conecte.

## Testing

Los cambios se pueden probar:

1. **Crear usuario médico** con rol `MEDICO`
2. **Crear turnos** para ese médico en el dashboard
3. **Acceder como médico** a `/medicos`
4. **Marcar asistencia** de pacientes
5. **Verificar en admin** que los cambios se reflejen en `/dashboard`

## API Endpoints Utilizados

### Server Actions (Client → Server)
- `marcarAsistido(turnoId)` - POST
- `marcarRetrasado(turnoId)` - POST
- `marcarAusencia(turnoId)` - POST

### Server Queries (Server → BD)
- `getTurnosMedicoHoy(profesionalId)` - GET
- `getTurnosMedicoResumen(profesionalId)` - GET
