# 🚀 Inicio Rápido - Panel de Administración

## Pasos para comenzar

### 1. Configurar Clerk (Autenticación)

```bash
# 1. Ve a https://clerk.com y crea una cuenta gratuita
# 2. Crea una nueva aplicación
# 3. Copia las API Keys desde el dashboard
```

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` y reemplaza los valores:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXX
CLERK_SECRET_KEY=sk_test_XXXXX
DATABASE_URL=tu_conexion_de_base_de_datos
```

### 3. Instalar y Ejecutar

```bash
# En la carpeta clinica-admin:
npm install
npm run prisma:generate
npm run dev
```

### 4. Acceder

Abre tu navegador en: **http://localhost:3001**

---

## ✅ Checklist de Configuración

- [ ] Cuenta de Clerk creada
- [ ] API Keys copiadas en `.env.local`
- [ ] Base de datos configurada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Prisma generado (`npm run prisma:generate`)
- [ ] Servidor corriendo (`npm run dev`)

---

## 📋 Datos de Prueba

Para poblar la base de datos con datos de prueba:

```bash
npm run db:seed
```

Esto creará:
- Una clínica de ejemplo
- Especialidades (Cardiología, Pediatría, etc.)
- Profesionales de ejemplo
- Obras sociales
- Horarios de atención

---

## 🎯 Primer Uso

1. **Regístrate**: Crea tu cuenta en `/sign-up`
2. **Crea Profesionales**: Ve a "Profesionales" y agrega médicos
3. **Configura Horarios**: Asigna días y horarios de atención
4. **Crea Obras Sociales**: Registra las obras sociales
5. **Gestiona Turnos**: Comienza a crear y administrar turnos

---

## 🆘 Problemas Comunes

### "Unauthorized" al cargar el dashboard
- Verifica que las API Keys de Clerk sean correctas
- Asegúrate de estar usando las keys de tu aplicación

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correcta en `.env.local`
- Asegúrate de que la base de datos esté activa

### No aparecen especialidades al crear profesional
- Ejecuta el seed: `npm run db:seed`
- O crea especialidades manualmente en la base de datos

---

## 📞 ¿Necesitas Ayuda?

Revisa el archivo `README.md` completo para más detalles.
