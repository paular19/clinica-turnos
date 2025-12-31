# 🏥 Sistema de Gestión de Turnos - Clínica

Sistema completo de gestión de turnos médicos con dos aplicaciones independientes:
- **clinica-admin**: Sistema administrativo para gestión interna
- **clinica-landing**: Landing page pública para solicitud de turnos

## 🚀 Quick Start

### Desarrollo Local

```bash
# 1. Instalar dependencias en ambos proyectos
cd clinica-admin && npm install
cd ../clinica-landing && npm install

# 2. Configurar variables de entorno
cp clinica-admin/.env.example clinica-admin/.env
cp clinica-landing/.env.example clinica-landing/.env
# Editá los archivos .env con tus credenciales

# 3. Generar Prisma Client
cd ..
npx prisma generate

# 4. Correr migraciones
npx prisma migrate dev

# 5. Seed de la base de datos
cd clinica-admin
npm run db:seed

# 6. Correr ambos proyectos (en terminales separadas)
# Terminal 1 - Admin
cd clinica-admin
npm run dev  # http://localhost:3001

# Terminal 2 - Landing
cd clinica-landing
npm run dev  # http://localhost:3000
```

## 📂 Estructura del Proyecto

```
clinica-turnos/
├── lib/              # Código compartido (actions, queries, utils)
├── prisma/           # Schema y migraciones de DB
├── clinica-admin/    # Sistema administrativo (puerto 3001)
└── clinica-landing/  # Landing pública (puerto 3000)
```

## 📚 Documentación

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guía completa de deployment en Vercel
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura detallada del proyecto
- **[ARCHITECTURE_FLOWS.md](ARCHITECTURE_FLOWS.md)** - Flujos de la aplicación

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Auth**: Clerk (solo admin)
- **Email**: Nodemailer + Gmail SMTP
- **PDF**: pdf-lib
- **Validación**: Zod
- **Styling**: Tailwind CSS

## 🌐 Deployment

Cada proyecto se deploya por separado en Vercel:

### clinica-admin
- Root Directory: `clinica-admin`
- URL: https://clinica-admin.vercel.app

### clinica-landing
- Root Directory: `clinica-landing`
- URL: https://clinica-landing.vercel.app

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

## 🔐 Variables de Entorno

### clinica-admin
```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
NEXT_PUBLIC_URL=
```

### clinica-landing
```env
DATABASE_URL=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
NEXT_PUBLIC_URL=
```

Ver archivos `.env.example` en cada carpeta para más detalles.

## 📝 Scripts Disponibles

### clinica-admin
```bash
npm run dev              # Desarrollo (puerto 3001)
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run typecheck        # Verificar tipos TypeScript
npm run prisma:generate  # Generar Prisma Client
npm run db:seed          # Seed de la base de datos
```

### clinica-landing
```bash
npm run dev        # Desarrollo (puerto 3000)
npm run build      # Build de producción
npm run start      # Servidor de producción
npm run typecheck  # Verificar tipos TypeScript
```

## 🤝 Contribuir

1. Hacé un fork del proyecto
2. Creá una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commiteá tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Pusheá a la rama (`git push origin feature/AmazingFeature`)
5. Abrí un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto

Para consultas o soporte, contactá a través de [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)

---

⭐ Si te gustó este proyecto, dale una estrella en GitHub!
