# Turnos App

Aplicación completa para gestión de turnos médicos (reserva pública, administración y panel de médicos).

Características principales:
- Reservas públicas de turnos con validación y envío de confirmación por email.
- CRUD de profesionales, especialidades y pacientes (admin).
- Panel de médicos con agenda diaria y marcación de asistencia.
- PDF con comprobante de turno descargable.
- Integración con Clerk para autenticación y multi-tenant (Organizations -> Clinic).
- Revalidación de rutas después de mutaciones (revalidatePath).

Prerequisitos:
- Node 20+
- PostgreSQL accesible (DATABASE_URL)
- npm (o pnpm/yarn)
- Opcional: cuenta de Clerk para autenticación
- Opcional: SMTP credentials o Resend API key para envío de emails

Instalación

1. Clonar el repositorio
    git clone <repo-url>
    cd turnos-app

2. Copiar variables de entorno
    cp .env.example .env.local
   Editar `.env.local` con tus credenciales: DATABASE_URL, CLERK keys, SMTP o RESEND.

3. Instalar dependencias
    npm install

4. Generar Prisma Client y migrar la DB
    npx prisma generate
    npx prisma migrate dev --name init

5. (Opcional) Seed inicial (si dispones de CLERK_ORG_ID en .env.local)
    node prisma/seed.ts

6. Ejecutar en modo desarrollo
    npm run dev

7. Construir para producción
    npm run build
    npm start

Variables de entorno (exigidas)
- DATABASE_URL: URL de conexión PostgreSQL
- CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_JWT_KEY: claves de Clerk (opcional si no usas auth)
- NEXT_PUBLIC_URL: URL pública (ej. http://localhost:3000)
- RESEND_API_KEY o SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM para email
- GOOGLE_CLIENT_ID/SECRET si usas integración con Google Calendar

Estructura del proyecto (resumen)
- app/ - Rutas de Next.js App Router (public, admin, medico)
- lib/ - Acciones del servidor, consultas a BD, utilidades, email y PDF
- prisma/ - Esquema y seed
- components/ - UI y componentes reutilizables
- public/ - Assets públicos
- scripts/ - Scripts útiles

Cómo usar
- Abrir http://localhost:3000 para ver el landing
- Ir a /turnos para flujo público de reserva (aún simplificado)
- Panel admin (requiere configuración de Clerk y usuarios mapeados a Usuario con rol ADMIN)

Resolución de problemas comunes
- Error "DATABASE_URL required": Asegurarse de tener .env.local con DATABASE_URL correcto y que la base esté accesible.
- Problemas con Prisma y HMR en desarrollo: Ver HMR_NOTE.txt para instrucciones y confirmar uso del singleton prisma client en lib/db/prisma.ts.
- Emails no llegan: Revisar SMTP_* vars o usar `RESEND_API_KEY`. En desarrollo, si no se configuran credenciales, los emails se "envían" a un transporter JSON y se registran en logs.
- Clerk: Si usas autenticación, crear Organizations y anotar su id en Clinic tenantId (puede hacerse con webhook provided en app/api/auth/route.ts o manualmente con prisma seed).

Comandos útiles
- npm run dev -> desarrollo
- npm run build -> build producción
- npm start -> iniciar server en producción
- npm run prisma:generate -> prisma generate
- npm run prisma:migrate -> prisma migrate dev

Tests
- Se incluyen tests de ejemplo en tests/ (Jest) - configurar ambiente de pruebas si se desea ejecutar.

Licencia
- MIT. Ver LICENSE.
