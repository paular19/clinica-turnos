# Panel de Administración - Clínica Turnos

Sistema completo de administración para gestionar turnos, profesionales, obras sociales y horarios.

## 🚀 Características Implementadas

### ✅ Autenticación
- Login y registro con **Clerk**
- Protección de rutas del dashboard
- Gestión de usuarios y roles

### ✅ Dashboard Principal
- Vista general con estadísticas
- Acciones rápidas
- Navegación intuitiva

### ✅ Gestión de Profesionales
- Crear, editar y eliminar profesionales
- Asignar especialidades
- Ver turnos y horarios asociados
- Vincular obras sociales

### ✅ Gestión de Obras Sociales
- Crear y administrar obras sociales
- Activar/desactivar coberturas
- Ver profesionales vinculados
- Gestionar vinculaciones

### ✅ Gestión de Horarios
- Configurar horarios laborales por profesional
- Definir días de atención
- Establecer intervalos entre turnos
- Vista organizada por profesional

### ✅ Gestión de Turnos
- Ver todos los turnos
- Filtrar por profesional y estado
- Crear nuevos turnos
- Cancelar turnos
- Confirmar turnos
- Marcar como asistido

## 📦 Instalación

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `clinica-admin` con:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_publishable_key
CLERK_SECRET_KEY=tu_clerk_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=tu_database_url
```

### 2. Obtener Credenciales de Clerk

1. Ve a [clerk.com](https://clerk.com) y crea una cuenta
2. Crea una nueva aplicación
3. En el dashboard de Clerk, ve a **API Keys**
4. Copia:
   - `Publishable key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `Secret key` → `CLERK_SECRET_KEY`

### 3. Instalar Dependencias

```bash
cd clinica-admin
npm install
```

### 4. Configurar Base de Datos

```bash
# Generar el cliente Prisma
npm run prisma:generate

# Ejecutar migraciones (si es necesario)
npx prisma migrate dev

# Poblar la base de datos con datos iniciales
npm run db:seed
```

### 5. Iniciar el Servidor

```bash
npm run dev
```

El panel de administración estará disponible en: **http://localhost:3001**

## 🎯 Uso

### Primer Acceso

1. Ve a `http://localhost:3001`
2. Serás redirigido al login de Clerk
3. Crea una cuenta o inicia sesión
4. Una vez autenticado, accederás al dashboard

### Flujo de Trabajo Recomendado

1. **Crear Especialidades** (si aún no existen en la BD)
2. **Crear Profesionales** y asignarles especialidades
3. **Crear Obras Sociales**
4. **Vincular Obras Sociales a Profesionales**
5. **Configurar Horarios Laborales** para cada profesional
6. **Gestionar Turnos** (crear, confirmar, cancelar)

## 📁 Estructura del Proyecto

```
clinica-admin/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout con sidebar
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── profesionales/          # Gestión de profesionales
│   │   ├── obras-sociales/         # Gestión de obras sociales
│   │   ├── horarios/               # Gestión de horarios
│   │   └── turnos/                 # Gestión de turnos
│   ├── sign-in/                    # Login con Clerk
│   ├── sign-up/                    # Registro con Clerk
│   └── layout.tsx                  # Layout principal con ClerkProvider
├── lib/
│   ├── actions/
│   │   ├── admin.ts                # Acciones de administración
│   │   └── turnos.ts               # Acciones de turnos
│   └── db/
│       └── prisma.ts               # Cliente de Prisma
└── middleware.ts                   # Middleware de Clerk
```

## 🔐 Roles y Permisos

El sistema está preparado para manejar dos roles:
- **ADMIN**: Acceso completo al panel de administración
- **MEDICO**: Acceso limitado (futuras funcionalidades)

## 🛠️ Tecnologías Utilizadas

- **Next.js 15**: Framework de React
- **Clerk**: Autenticación y gestión de usuarios
- **Prisma**: ORM para base de datos
- **PostgreSQL**: Base de datos
- **Tailwind CSS**: Estilos
- **TypeScript**: Tipado estático
- **Lucide React**: Iconos

## 📝 Notas Importantes

1. **Clerk**: Asegúrate de configurar correctamente las URLs de redirección en el dashboard de Clerk
2. **Base de Datos**: El esquema de Prisma ya está configurado en `prisma/schema.prisma`
3. **Puerto**: El servidor corre en el puerto 3001 (configurable en `package.json`)
4. **Datos de Prueba**: Usa el seed script para poblar la base de datos con datos de prueba

## 🐛 Solución de Problemas

### Error de autenticación
- Verifica que las variables de entorno de Clerk estén correctas
- Revisa que las URLs de redirección estén configuradas en Clerk

### Error de base de datos
- Verifica que la variable `DATABASE_URL` esté correcta
- Ejecuta `npm run prisma:generate` para regenerar el cliente

### Error al crear profesional
- Asegúrate de tener al menos una especialidad creada en la base de datos

## 📞 Soporte

Si encuentras algún problema o tienes preguntas, revisa:
1. La consola del navegador para errores de JavaScript
2. Los logs del servidor en la terminal
3. Las variables de entorno en `.env.local`

## 🎨 Personalización

Puedes personalizar los colores y estilos editando:
- `tailwind.config.js`: Configuración de Tailwind
- `app/globals.css`: Estilos globales
- Los componentes individuales para cambiar su apariencia

---

¡Listo! Ya tienes un sistema completo de administración para tu clínica 🏥
