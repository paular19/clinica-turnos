# 🚀 Guía de Deployment - Proyectos Separados en Vercel

## 📋 Resumen

Ahora tenés **dos proyectos Next.js independientes**:
- **`clinica-admin`** → Sistema administrativo (puerto 3001)
- **`clinica-landing`** → Landing page pública (puerto 3000)

Ambos comparten:
- Base de datos PostgreSQL (Prisma)
- Carpeta `/lib` con lógica compartida
- Carpeta `/prisma` con schema y migraciones

---

## 📂 Estructura del Repositorio

```
clinica-turnos/
│
├── 📁 lib/                          [COMPARTIDO] Lógica reutilizable
│   ├── actions/                     ← Server actions
│   ├── queries/                     ← Database queries
│   ├── email/                       ← Email templates
│   ├── pdf/                         ← PDF generation
│   ├── db/prisma.ts                ← Prisma client
│   └── zod/schemas.ts              ← Validaciones
│
├── 📁 prisma/                       [COMPARTIDO] Base de datos
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── 📁 clinica-admin/                [PROYECTO 1 - Admin]
│   ├── package.json                 ← Dependencies admin
│   ├── next.config.js
│   ├── tsconfig.json                ← Alias @/lib/* → ../lib/*
│   ├── .env                         ← Variables admin
│   ├── app/
│   │   ├── (auth)/                  ← Login con Clerk
│   │   ├── (dashboard)/             ← Dashboard admin
│   │   │   ├── admin/
│   │   │   ├── medico/
│   │   │   └── paciente/
│   │   └── layout.tsx
│   └── components/
│
└── 📁 clinica-landing/              [PROYECTO 2 - Landing]
    ├── package.json                 ← Dependencies landing
    ├── next.config.js
    ├── tsconfig.json                ← Alias @/lib/* → ../lib/*
    ├── .env                         ← Variables landing
    ├── app/
    │   └── (public)/
    │       ├── page.tsx             ← Home
    │       └── turnos/              ← Sección turnos
    └── lib/
        └── actions/
            └── mis-turnos-actions.ts ← Server actions públicas
```

---

## 🔧 Configuración Local

### 1. Instalar Dependencias

```bash
# En clinica-admin
cd clinica-admin
npm install

# En clinica-landing
cd ../clinica-landing
npm install
```

### 2. Configurar Variables de Entorno

#### **clinica-admin/.env**
```env
# Database (compartida)
DATABASE_URL="postgresql://..."

# Clerk Auth (solo admin)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="Clínica Admin <noreply@ejemplo.com>"

# URLs
NEXT_PUBLIC_URL=http://localhost:3001
NEXT_PUBLIC_LANDING_URL=http://localhost:3000
```

#### **clinica-landing/.env**
```env
# Database (compartida)
DATABASE_URL="postgresql://..."

# Email (mismo que admin)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM="Clínica <noreply@ejemplo.com>"

# URLs
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### 3. Generar Prisma Client

```bash
# Desde la raíz del proyecto
cd prisma
npx prisma generate

# O desde cualquier carpeta
npx prisma generate --schema=../prisma/schema.prisma
```

### 4. Correr Migraciones

```bash
# Desde la raíz
npx prisma migrate dev

# O desde clinica-admin
npm run prisma:generate
```

### 5. Seed de la Base de Datos

```bash
# Desde clinica-admin
npm run db:seed
```

### 6. Correr en Desarrollo

Abrí **dos terminales**:

```bash
# Terminal 1 - Admin (puerto 3001)
cd clinica-admin
npm run dev

# Terminal 2 - Landing (puerto 3000)
cd clinica-landing
npm run dev
```

**URLs:**
- Admin: http://localhost:3001
- Landing: http://localhost:3000

---

## 🌐 Deployment en Vercel

### Paso 1: Subir a GitHub

```bash
# Desde la raíz del proyecto
git add .
git commit -m "Separar proyectos admin y landing"
git push origin main
```

### Paso 2: Crear Proyecto Admin en Vercel

1. Ve a [vercel.com](https://vercel.com) y hacé clic en **"New Project"**
2. Importá tu repositorio de GitHub
3. **Configuración del proyecto:**
   - **Project Name:** `clinica-admin`
   - **Root Directory:** `clinica-admin` ⚠️ **IMPORTANTE**
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Variables de Entorno** (Environment Variables):
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   SMTP_FROM=Clínica Admin <noreply@ejemplo.com>
   NEXT_PUBLIC_URL=https://clinica-admin.vercel.app
   NEXT_PUBLIC_LANDING_URL=https://clinica-landing.vercel.app
   ```

5. Hacé clic en **Deploy**

### Paso 3: Crear Proyecto Landing en Vercel

1. En Vercel, hacé clic en **"New Project"** de nuevo
2. Importá **el mismo repositorio** de GitHub
3. **Configuración del proyecto:**
   - **Project Name:** `clinica-landing`
   - **Root Directory:** `clinica-landing` ⚠️ **IMPORTANTE**
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

4. **Variables de Entorno** (Environment Variables):
   ```
   DATABASE_URL=postgresql://...
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASS=tu-app-password
   SMTP_FROM=Clínica <noreply@ejemplo.com>
   NEXT_PUBLIC_URL=https://clinica-landing.vercel.app
   NEXT_PUBLIC_ADMIN_URL=https://clinica-admin.vercel.app
   ```

5. Hacé clic en **Deploy**

---

## ⚙️ Configuración Avanzada Vercel

### Build Settings en Vercel

#### Para clinica-admin:
```json
{
  "buildCommand": "cd .. && npx prisma generate --schema=./prisma/schema.prisma && cd clinica-admin && npm run build",
  "outputDirectory": "clinica-admin/.next",
  "installCommand": "npm install"
}
```

#### Para clinica-landing:
```json
{
  "buildCommand": "cd .. && npx prisma generate --schema=./prisma/schema.prisma && cd clinica-landing && npm run build",
  "outputDirectory": "clinica-landing/.next",
  "installCommand": "npm install"
}
```

### Ignorar Build Paths

En Vercel Settings → Git, configurá **Ignored Build Step** para que no se depliye cuando cambien archivos del otro proyecto:

**Para clinica-admin:**
```bash
git diff --quiet HEAD^ HEAD -- clinica-admin/ lib/ prisma/
```

**Para clinica-landing:**
```bash
git diff --quiet HEAD^ HEAD -- clinica-landing/ lib/ prisma/
```

---

## 🔗 Importaciones entre Proyectos

### En clinica-admin

```typescript
// ✅ Importar desde lib compartida
import { prisma } from "@/lib/db/prisma"
import { crearTurno } from "@/lib/actions/turnos"
import { solicitudTurnoSchema } from "@/lib/zod/schemas"
```

### En clinica-landing

```typescript
// ✅ Importar desde lib compartida
import { prisma } from "@/lib/db/prisma"
import { buscarTurnoPorCodigo } from "@/lib/actions/mis-turnos-actions"

// ✅ O desde lib local (server actions específicas)
import { cancelarTurno } from "../../../../lib/actions/mis-turnos-actions"
```

---

## 📝 Checklist de Deployment

### Antes de Deployar

- [ ] Ambos proyectos compilan sin errores localmente
  ```bash
  cd clinica-admin && npm run build
  cd ../clinica-landing && npm run build
  ```
- [ ] Las variables de entorno están configuradas en `.env`
- [ ] Prisma Client está generado
- [ ] El código está pusheado a GitHub

### En Vercel

- [ ] **clinica-admin** tiene Root Directory = `clinica-admin`
- [ ] **clinica-landing** tiene Root Directory = `clinica-landing`
- [ ] Todas las variables de entorno están configuradas
- [ ] Los URLs están actualizados (`NEXT_PUBLIC_URL`, etc.)
- [ ] Los deployments están corriendo sin errores

### Después del Deploy

- [ ] Probá login en admin
- [ ] Probá crear turno desde landing
- [ ] Verificá que los emails se envíen
- [ ] Confirmá que la DB funciona en ambos

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/lib/...'"

**Solución:** Verificá que el `tsconfig.json` tenga:
```json
"paths": {
  "@/*": ["./*"],
  "@/lib/*": ["../lib/*"]
}
```

### Error: "Prisma Client not generated"

**Solución:** En Vercel Build Settings, cambiá el comando a:
```bash
cd .. && npx prisma generate --schema=./prisma/schema.prisma && cd [carpeta] && npm run build
```

### Error: "Module not found: Can't resolve '../lib/...'"

**Solución:** Verificá que la carpeta `/lib` esté en el repositorio y no en `.gitignore`.

---

## 🎯 Ventajas de esta Arquitectura

✅ **Proyectos independientes:** Cada app tiene su propio `package.json`  
✅ **Deployments separados:** Admin y landing no se afectan entre sí  
✅ **Código compartido:** La carpeta `/lib` evita duplicación  
✅ **Base de datos única:** Ambos usan el mismo Prisma schema  
✅ **Fácil escalabilidad:** Podés agregar más proyectos (ej: API standalone)  
✅ **Sin dotenv:** Variables de entorno manejadas por Vercel  

---

## 📚 Recursos

- [Next.js Monorepo Guide](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Monorepo Deployment](https://vercel.com/docs/concepts/git/monorepos)
- [Prisma Multi-Project Setup](https://www.prisma.io/docs/guides/other/monorepos)

---

¡Listo! 🎉 Ahora tenés dos proyectos independientes listos para deploy en Vercel.
