# Guía del Dashboard de Médicos

## Descripción General
El dashboard de médicos permite a los profesionales sanitarios:
- Visualizar sus turnos del día
- Marcar la asistencia o ausencia de pacientes
- Ver estadísticas en tiempo real
- Sincronizar automáticamente con el dashboard del administrador

## Acceso al Sistema
1. Los médicos acceden a través de su cuenta Clerk
2. URL: `http://localhost:3000/medicos`
3. Se requiere autenticación y un perfil de profesional asociado

## Funcionalidades Principales

### 1. Dashboard Principal (/medicos)
**Componentes:**
- **Bienvenida personalizada**: Saludo con el nombre del profesional
- **Información profesional**: Matrícula y especialidades
- **Resumen del día**: Estadísticas de turnos
  - Total de turnos
  - Asistidos
  - Confirmados
  - Retrasados
  
**Acciones rápidas:**
- Ir a "Mis Turnos" para gestionar asistencias
- Ver "Horarios" disponibles
- Acceder a "Configuración" de perfil

### 2. Mis Turnos (/medicos/turnos)
**Interfaz:**
- Tabla con lista de turnos del día ordenados por hora
- Filtro automático: solo muestra turnos de hoy

**Información de cada turno:**
- **Hora**: Hora del turno
- **Paciente**: Nombre completo y DNI
- **Contacto**: Teléfono y email del paciente
- **Obra Social**: Si aplica
- **Especialidad**: Especialidad asociada al turno
- **Estado**: Estado actual del turno (color codificado)
- **Acciones**: Botones para marcar asistencia/ausencia

**Estados de turnos con colores:**
- 🔵 CONFIRMADO: Turno confirmado, listo para comenzar
- 🟡 PENDIENTE: Turno pendiente de confirmación
- 🟠 RETRASADO: Paciente retrasado
- 🟢 ASISTIDO: Paciente asistió
- 🔴 AUSENCIA: Paciente ausente
- ⚫ CANCELADO: Turno cancelado

### 3. Marcar Asistencia
**Estados permitidos para cambio:**
- CONFIRMADO → ASISTIDO
- PENDIENTE → ASISTIDO
- RETRASADO → ASISTIDO

**Proceso:**
1. Click en el botón ✓ (verde) de la fila del turno
2. Confirmar en el diálogo
3. El estado cambia a ASISTIDO
4. Se sincroniza automáticamente con el administrador

### 4. Marcar Retrasado
**Uso:** Cuando un paciente llega retrasado

**Estados permitidos:**
- CONFIRMADO → RETRASADO
- PENDIENTE → RETRASADO

**Proceso:**
1. Click en el botón ⏱ (naranja) de la fila del turno
2. Confirmar en el diálogo
3. El estado cambia a RETRASADO
4. Después puede marcarse como ASISTIDO

### 5. Marcar Ausencia
**Uso:** Cuando un paciente no asiste

**Estados permitidos:**
- CONFIRMADO → AUSENCIA
- PENDIENTE → AUSENCIA
- RETRASADO → AUSENCIA

**Proceso:**
1. Click en el botón ✕ (rojo) de la fila del turno
2. Confirmar en el diálogo
3. El estado cambia a AUSENCIA
4. Se registra automáticamente en la base de datos

## Estados de Turnos

### Ciclo de vida del turno desde la perspectiva del médico:

```
PENDIENTE/CONFIRMADO
        ↓
    ↙       ↘
RETRASADO   ASISTIDO
    ↓
ASISTIDO
```

O en caso de ausencia:
```
PENDIENTE/CONFIRMADO → AUSENCIA
```

## Sincronización con el Administrador

**Actualización en tiempo real:**
- Cada cambio de estado se registra automáticamente
- El administrador puede ver:
  - Qué turnos se completaron
  - Qué pacientes no asistieron
  - Información de retrasos
  - Estadísticas diarias por profesional

**En el dashboard del admin:**
- Nueva sección "Asistencia de Médicos"
- Filtros por profesional y fecha
- Reporte de ausencias y retrasos

## Flujo de Trabajo Recomendado

### Al Inicio del Día:
1. Médico accede a `/medicos`
2. Revisa el resumen de turnos del día
3. Verifica el total de pacientes esperados
4. Puede revisar información detallada en "Mis Turnos"

### Durante la Consulta:
1. Médico va a `/medicos/turnos`
2. Cuando el paciente llega:
   - Si es a tiempo: marca como ASISTIDO
   - Si es retrasado: marca como RETRASADO, después ASISTIDO
3. Si no llega: marca como AUSENCIA

### Visualización Actualizada:
- Las estadísticas se actualizan inmediatamente
- El administrador ve los cambios en tiempo real
- Reportes disponibles para análisis

## Seguridad y Permisos

**Validaciones implementadas:**
- Solo el médico asignado al turno puede cambiar su estado
- Verificación de autenticación mediante Clerk
- Consultas limitadas a turnos del profesional
- Sincronización de datos en base de datos

**Datos visibles:**
- Solo turnos del médico logueado
- Información del paciente (nombre, DNI, contacto)
- Especialidad de la consulta
- Obra social (si aplica)

## Errores Comunes y Soluciones

**"No tienes un perfil de profesional asociado"**
- Contactar al administrador
- El usuario necesita tener un registro en la tabla Profesional

**"No tienes permisos para modificar este turno"**
- Solo puedes cambiar estado de tus propios turnos
- Verifica que estés logueado con la cuenta correcta

**Los cambios no aparecen en el dashboard del admin**
- Espera unos segundos para que se sincronicen
- Refresca la página del administrador
- Verifica tu conexión a internet

## Tecnología Utilizada

- **Frontend**: Next.js 15 + React
- **Backend**: Next.js Server Actions
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Clerk
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Formato de Fechas**: date-fns

## Archivos Implementados

```
clinica-admin/
├── app/
│   └── medicos/
│       ├── page.tsx                    (Dashboard principal)
│       ├── layout.tsx                  (Layout de médicos)
│       └── turnos/
│           ├── page.tsx                (Lista de turnos del día)
│           └── TurnoMedicoActions.tsx  (Componente de acciones)
├── lib/
│   ├── actions/
│   │   └── medicos.ts                  (Server actions)
│   └── queries/
│       └── turnos.ts                   (Queries de datos)
└── prisma/
    └── schema.prisma                   (Schema con estado AUSENCIA)
```

## Próximas Mejoras Sugeridas

- [ ] Notas médicas por consulta
- [ ] Adjuntar documentos (estudios, análisis)
- [ ] Historial de consultas del paciente
- [ ] Alertas para retrasos significativos
- [ ] Exportar reportes diarios
- [ ] Vista de calendario mensual
- [ ] Integración con recordatorios SMS
- [ ] Firma digital de constancia de asistencia
