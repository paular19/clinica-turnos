# 🔧 Solución de Problemas (Troubleshooting)

## Problemas Comunes y Soluciones

### 🔴 Error: "Unauthorized" o "No autorizado"

**Problema:** Al intentar acceder al dashboard, aparece un error de autorización.

**Posibles causas:**
1. Las API Keys de Clerk no están configuradas
2. Las API Keys son incorrectas
3. No has iniciado sesión

**Solución:**
```bash
# 1. Verifica que .env.local tenga las keys correctas
cat .env.local

# 2. Asegúrate de que comiencen con:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...

# 3. Reinicia el servidor
npm run dev
```

---

### 🔴 Error: "Cannot find module '@clerk/nextjs'"

**Problema:** Error al importar Clerk.

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules
rm package-lock.json
npm install
```

---

### 🔴 Error: "Prisma Client not generated"

**Problema:** El cliente de Prisma no está generado.

**Solución:**
```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Si el problema persiste, intenta:
npx prisma generate --schema=./prisma/schema.prisma
```

---

### 🔴 Error de Base de Datos

**Problema:** No puede conectarse a la base de datos.

**Síntomas:**
- `Connection refused`
- `Database does not exist`
- `Invalid connection string`

**Solución:**
```bash
# 1. Verifica la variable DATABASE_URL en .env.local
# Formato correcto:
# DATABASE_URL="postgresql://usuario:password@host:5432/nombre_db?schema=public"

# 2. Verifica que la base de datos esté corriendo
# Si usas PostgreSQL local:
# Windows: Verifica en Servicios que PostgreSQL esté corriendo
# Mac/Linux: sudo service postgresql status

# 3. Prueba la conexión manualmente
psql -U usuario -d nombre_db
```

---

### 🔴 Error: "No hay especialidades disponibles"

**Problema:** Al crear un profesional, no aparecen especialidades.

**Solución:**
```bash
# Opción 1: Ejecutar el seed
npm run db:seed

# Opción 2: Crear especialidades manualmente en la base de datos
# Conéctate a tu base de datos y ejecuta:
INSERT INTO "Especialidad" (id, nombre, "clinicId", "createdAt", "updatedAt") 
VALUES 
  (gen_random_uuid(), 'Cardiología', 'tu_clinic_id', NOW(), NOW()),
  (gen_random_uuid(), 'Pediatría', 'tu_clinic_id', NOW(), NOW());
```

---

### 🔴 Puerto 3001 ya en uso

**Problema:** El puerto 3001 está ocupado.

**Solución:**
```bash
# Windows PowerShell
# Ver qué proceso usa el puerto 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Matar el proceso (reemplaza PID con el número que aparece)
Stop-Process -Id PID -Force

# O usa otro puerto
# Edita package.json:
# "dev": "next dev -p 3002"
```

---

### 🔴 Error: "Module not found: Can't resolve 'date-fns'"

**Problema:** Falta instalar date-fns.

**Solución:**
```bash
npm install date-fns
```

---

### 🔴 Error: "Module not found: Can't resolve 'lucide-react'"

**Problema:** Falta instalar lucide-react.

**Solución:**
```bash
npm install lucide-react
```

---

### 🔴 Los estilos no se aplican correctamente

**Problema:** Tailwind CSS no funciona.

**Solución:**
```bash
# 1. Verifica que globals.css esté importado en layout.tsx
# 2. Reinicia el servidor
npm run dev

# 3. Si el problema persiste, borra el cache
rm -rf .next
npm run dev
```

---

### 🔴 Error al crear usuario: "Usuario no encontrado"

**Problema:** El usuario de Clerk no está sincronizado con la base de datos.

**Solución:**
1. Después de registrarte en Clerk, debes crear el usuario en tu BD
2. Asegúrate de que exista una clínica en la tabla `Clinic`
3. Crea manualmente el usuario en la tabla `Usuario`:

```sql
INSERT INTO "Usuario" (id, "clerkId", nombre, email, rol, "clinicId") 
VALUES (
  gen_random_uuid(), 
  'tu_clerk_user_id',  -- Lo obtienes del dashboard de Clerk
  'Tu Nombre', 
  'tu@email.com', 
  'ADMIN', 
  'tu_clinic_id'
);
```

---

### 🔴 "CORS error" al hacer requests

**Problema:** Errores de CORS en las peticiones.

**Solución:**
1. Verifica que estés accediendo desde `localhost:3001`
2. Clerk debe tener configurado `localhost:3001` como URL permitida
3. Revisa la configuración de Clerk Dashboard → Settings → URLs

---

### 🟡 Los cambios no se reflejan

**Problema:** Haces cambios pero no aparecen en el navegador.

**Solución:**
```bash
# 1. Hard refresh en el navegador
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R

# 2. Borra el cache de Next.js
rm -rf .next
npm run dev

# 3. Verifica que el archivo esté guardado
```

---

### 🟡 "Hydration error" en el navegador

**Problema:** Error de hidratación de React.

**Causas comunes:**
1. Diferencias entre server y client rendering
2. HTML inválido (ej: `<div>` dentro de `<p>`)
3. Uso incorrecto de `useEffect`

**Solución:**
1. Revisa la consola del navegador para ver qué componente falla
2. Asegúrate de que el HTML sea válido
3. Usa `'use client'` si el componente necesita estado del cliente

---

### 🟡 El formulario no se envía

**Problema:** Al hacer submit, no pasa nada.

**Checklist:**
- [ ] ¿Tiene `onSubmit={handleSubmit}`?
- [ ] ¿Previene el default con `e.preventDefault()`?
- [ ] ¿Los inputs tienen `name` attributes?
- [ ] ¿El botón es `type="submit"`?
- [ ] ¿Hay errores en la consola?

---

## 🛠️ Comandos Útiles de Debug

### Ver logs del servidor
```bash
# El servidor muestra logs en la terminal donde corriste npm run dev
# Busca mensajes de error ahí
```

### Inspeccionar base de datos
```bash
# Abrir Prisma Studio
npx prisma studio

# Se abrirá en http://localhost:5555
# Podrás ver y editar los datos directamente
```

### Limpiar todo y empezar de nuevo
```bash
# Borrar cache y dependencias
rm -rf .next node_modules package-lock.json

# Reinstalar
npm install

# Regenerar Prisma
npm run prisma:generate

# Iniciar
npm run dev
```

---

## 📞 Obtener Más Ayuda

### Logs importantes a revisar:

1. **Consola del navegador** (F12)
   - Errores de JavaScript
   - Network errors
   - Warnings de React

2. **Terminal del servidor**
   - Errores de Next.js
   - Errores de Prisma
   - Logs de Server Actions

3. **Prisma Studio**
   - Verificar datos en la BD
   - Ver relaciones entre tablas

### Información útil para reportar problemas:

- Versión de Node.js: `node --version`
- Sistema operativo: Windows/Mac/Linux
- Mensaje de error completo
- Qué estabas intentando hacer
- Pasos para reproducir el error

---

## 🔍 Checklist General de Debugging

Antes de pedir ayuda, verifica:

- [ ] `.env.local` existe y tiene todas las variables
- [ ] `npm install` se ejecutó sin errores
- [ ] `npm run prisma:generate` se ejecutó correctamente
- [ ] El servidor corre sin errores (`npm run dev`)
- [ ] Puedes acceder a `http://localhost:3001`
- [ ] No hay errores en la consola del navegador
- [ ] La base de datos está corriendo
- [ ] Las credenciales de Clerk son correctas

---

## 💡 Tips de Performance

### Si el servidor es lento:

1. **Reduce el tamaño de consultas:**
```typescript
// ❌ Malo - trae todo
const turnos = await prisma.turno.findMany();

// ✅ Bueno - limita resultados
const turnos = await prisma.turno.findMany({
  take: 100,
  orderBy: { fecha: 'desc' }
});
```

2. **Usa índices en Prisma:**
```prisma
@@index([fecha, profesionalId])
```

3. **Implementa paginación:**
```typescript
const turnos = await prisma.turno.findMany({
  take: 20,
  skip: page * 20,
});
```

---

## 🎯 Recursos Adicionales

- [Next.js Debugging](https://nextjs.org/docs/app/building-your-application/configuring/debugging)
- [Clerk Troubleshooting](https://clerk.com/docs/troubleshooting/overview)
- [Prisma Common Errors](https://www.prisma.io/docs/reference/api-reference/error-reference)

---

**¿Aún tienes problemas?** Revisa los logs detallados y comparte:
1. El mensaje de error completo
2. El código relevante
3. Qué estabas intentando hacer
