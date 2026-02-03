# 📧 Configuración de Emails con Resend

## ¿Qué es Resend?

Resend es una plataforma de email moderna, segura y confiable para aplicaciones web. Es mejor que usar SMTP de Gmail porque:

- ✅ Entrega confiable de emails
- ✅ Mejor para producción
- ✅ Fácil integración
- ✅ Manejo automático de rebotes
- ✅ Logs y análisis de entregas
- ✅ Soporte técnico

## 🚀 Pasos para Configurar Resend

### 1. Crear Cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Haz clic en "Sign Up"
3. Completa el formulario
4. Verifica tu email

### 2. Obtener API Key

1. Inicia sesión en Resend
2. Ve a **Settings** → **API Keys**
3. Haz clic en **Create API Key**
4. Copia la clave (comienza con `re_`)

### 3. Agregar a Variables de Entorno

**En `.env` (desarrollo local):**

```env
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM="Clínica San Rafael <noreply@clinicasanrafael.com>"
```

**En Vercel (producción):**

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Agrega:
   - `RESEND_API_KEY` = `re_xxxxx`
   - `RESEND_FROM` = `Clínica San Rafael <noreply@clinicasanrafael.com>`

### 4. Verificar Dominio (Producción)

Para usar tu propio dominio:

1. En Resend, ve a **Domains**
2. Agrega tu dominio: `noreply@tudominio.com`
3. Resend te mostrará registros DNS para agregar
4. Una vez verificado, cambia `RESEND_FROM` a tu dominio

## 📧 Cómo Funcionan los Emails

Los emails se envían automáticamente en 3 situaciones:

### 1. Cuando se Crea un Turno
```
Asunto: Turno confirmado - ABC123
Tipo: Creación
Color: Azul
```

### 2. Cuando se Cancela un Turno
```
Asunto: Turno cancelado - ABC123
Tipo: Cancelación
Color: Rojo
Incluye: Motivo de cancelación
```

### 3. Cuando se Reprograma un Turno
```
Asunto: Turno reprogramado - ABC123
Tipo: Reprogramación
Color: Naranja
Incluye: Nueva fecha y hora
```

## 🧪 Probar Emails Localmente

### Opción 1: Sin API Key (Modo Desarrollo)

Si **no configuras** `RESEND_API_KEY`, los emails se loguean en consola:

```bash
cd clinica-admin
npm run dev
```

Cuando se envíe un email, verás en terminal:

```
📧 Enviando email de creacion a: paciente@gmail.com
   Turno código: ABC123D4
⚠️  Modo desarrollo: Email JSON generado (no enviado)
{
  "to": "paciente@gmail.com",
  "subject": "Turno confirmado - ABC123D4",
  "html": "..."
}
```

### Opción 2: Usar Test Email de Resend

Resend permite enviar a cualquier email:

```bash
RESEND_API_KEY=re_xxxxx npm run dev
```

Ahora los emails se enviarán realmente. Prueba con tu propio email.

## 🔍 Ver Logs en Resend

1. Ve a [https://resend.com/emails](https://resend.com/emails)
2. Verás un historial de todos los emails enviados
3. Puedes ver:
   - Entregado ✅
   - Abierto 👀
   - Clickeado 🖱️
   - Rebotado ❌
   - Bloqueado 🚫

## ❌ Solucionar Problemas

### Error: "Invalid API Key"
```
✗ La API key es incorrecta o expiró
✓ Regenera una nueva en https://resend.com/api-keys
```

### Error: "Email bounced"
```
✗ El email del paciente no existe
✓ Verifica que esté bien escrito en la base de datos
```

### Los emails no se envían en producción
```
✗ RESEND_API_KEY no está configurada en Vercel
✓ Ve a Settings → Environment Variables en tu proyecto
```

### Los emails se loguean pero no se envían
```
✓ Esto es normal en desarrollo sin RESEND_API_KEY
✓ Agrega la clave para enviar realmente
```

## 📝 Migrar de SMTP a Resend

**Antes (SMTP):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña
```

**Después (Resend):**
```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM="Clínica San Rafael <noreply@clinicasanrafael.com>"
```

## 💡 Tips

1. **Plan Gratuito:** 100 emails/día. Perfecto para testing.
2. **Plan Pago:** Desde $20/mes. Incluye soporte y más emails.
3. **Verificar Emails:** Antes de ir a producción, prueba con tu propio email.
4. **Registros SPF/DKIM:** Resend los gestiona automáticamente.
5. **Unsubscribe:** Resend maneja automáticamente el link de desuscripción.

## 📚 Documentación Oficial

- Docs de Resend: [https://resend.com/docs](https://resend.com/docs)
- TypeScript SDK: [https://resend.com/docs/send-email](https://resend.com/docs/send-email)

---

**¿Preguntas?** Revisa los logs en Resend o verifica la consola en desarrollo.
