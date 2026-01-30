# ✅ CHECKLIST DE CONFIGURACIÓN

## 📋 Pasos para Poner en Marcha el Sistema

### Paso 1: Configurar Clerk (Autenticación) ⏱️ 5 min

- [ ] Ir a [https://clerk.com](https://clerk.com)
- [ ] Crear cuenta gratuita
- [ ] Crear nueva aplicación
- [ ] Ir a **API Keys**
- [ ] Copiar `Publishable key`
- [ ] Copiar `Secret key`
- [ ] Pegar en `.env.local`:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
  CLERK_SECRET_KEY=sk_test_xxxxx
  ```
- [ ] Guardar archivo `.env.local`

---

### Paso 2: Configurar Base de Datos ⏱️ 2 min

- [ ] Tener PostgreSQL instalado y corriendo
- [ ] Crear una base de datos (ej: `clinica_db`)
- [ ] Copiar la URL de conexión
- [ ] Pegar en `.env.local`:
  ```
  DATABASE_URL="postgresql://usuario:password@localhost:5432/clinica_db"
  ```
- [ ] Guardar archivo `.env.local`

---

### Paso 3: Instalar Dependencias ⏱️ 3 min

Abrir terminal en la carpeta `clinica-admin`:

```bash
cd clinica-admin
```

- [ ] Ejecutar: `npm install`
- [ ] Esperar a que termine (puede tardar 2-3 minutos)
- [ ] Verificar que no haya errores

---

### Paso 4: Generar Cliente Prisma ⏱️ 1 min

- [ ] Ejecutar: `npm run prisma:generate`
- [ ] Esperar mensaje de éxito
- [ ] (Opcional) Ejecutar migraciones: `npx prisma migrate dev`
- [ ] (Opcional) Poblar datos de prueba: `npm run db:seed`

---

### Paso 5: Iniciar el Servidor ⏱️ 1 min

**Opción A - Usando el script:**
- [ ] Doble clic en `start.bat` (Windows)

**Opción B - Manualmente:**
- [ ] Ejecutar: `npm run dev`
- [ ] Esperar mensaje: "Ready in XXXXms"
- [ ] Ver URL: `http://localhost:3001`

---

### Paso 6: Primer Acceso ⏱️ 2 min

- [ ] Abrir navegador en `http://localhost:3001`
- [ ] Serás redirigido a `/sign-in`
- [ ] Hacer clic en "Sign up" para crear cuenta
- [ ] Completar formulario de registro
- [ ] Verificar email si es necesario
- [ ] Ingresar al dashboard

---

### Paso 7: Configuración Inicial de Datos ⏱️ 5 min

**Si ejecutaste el seed, puedes saltar este paso.**

Si NO ejecutaste el seed, necesitas crear manualmente:

1. **Crear Clínica** (en la base de datos):
```sql
INSERT INTO "Clinic" (id, name, address)
VALUES (gen_random_uuid(), 'Mi Clínica', 'Dirección 123');
```

2. **Crear Usuario Admin** (en la base de datos):
```sql
INSERT INTO "Usuario" (id, "clerkId", nombre, email, rol, "clinicId")
VALUES (
  gen_random_uuid(),
  'tu_clerk_user_id',  -- Obtenerlo del dashboard de Clerk
  'Admin',
  'admin@email.com',
  'ADMIN',
  'id_de_tu_clinica'
);
```

3. **Crear Especialidades** (desde el dashboard):
- [ ] Ir a "Profesionales" → "Nuevo Profesional"
- [ ] Si no hay especialidades, créalas en la BD:
```sql
INSERT INTO "Especialidad" (id, nombre, "clinicId")
VALUES 
  (gen_random_uuid(), 'Cardiología', 'id_de_tu_clinica'),
  (gen_random_uuid(), 'Pediatría', 'id_de_tu_clinica');
```

---

### Paso 8: Usar el Sistema ⏱️ Ilimitado! 🎉

- [ ] Crear profesionales
- [ ] Configurar horarios
- [ ] Crear obras sociales
- [ ] Vincular obras sociales a profesionales
- [ ] Gestionar turnos

---

## 🎯 Verificación Rápida

¿Todo funciona? Verifica que puedas:

- [ ] ✅ Iniciar sesión
- [ ] ✅ Ver el dashboard
- [ ] ✅ Navegar entre secciones
- [ ] ✅ Crear un profesional
- [ ] ✅ Crear una obra social
- [ ] ✅ Crear un horario
- [ ] ✅ Crear un turno

---

## 🚨 Si algo falla

1. **Revisa TROUBLESHOOTING.md** para problemas comunes
2. **Verifica .env.local** tiene todas las variables
3. **Mira la consola** del navegador (F12)
4. **Revisa la terminal** donde corre el servidor
5. **Reinicia el servidor** (Ctrl+C, luego `npm run dev`)

---

## 📞 Archivos de Ayuda

| Archivo | Para qué sirve |
|---------|---------------|
| `README.md` | Guía completa de instalación |
| `INICIO_RAPIDO.md` | Guía rápida para comenzar |
| `DESARROLLO.md` | Para desarrolladores |
| `RUTAS.md` | Referencia de todas las rutas |
| `TROUBLESHOOTING.md` | Solución de problemas |
| `IMPLEMENTACION_COMPLETA.md` | Resumen de lo implementado |

---

## ✨ ¡Listo para Usar!

Si completaste todos los pasos, ¡tu sistema está funcionando!

**Próximos pasos:**
1. Crear profesionales
2. Configurar horarios de atención
3. Crear obras sociales
4. Comenzar a gestionar turnos

---

**¡Disfruta tu Panel de Administración!** 🏥💙

---

## 📊 Tiempo Total Estimado

| Tarea | Tiempo |
|-------|--------|
| Configurar Clerk | 5 min |
| Configurar DB | 2 min |
| Instalar dependencias | 3 min |
| Generar Prisma | 1 min |
| Iniciar servidor | 1 min |
| Primer acceso | 2 min |
| Configuración inicial | 5 min |
| **TOTAL** | **~20 min** |

¡En menos de 20 minutos tendrás todo funcionando! ⚡
