# 🚨 CONFIGURACIÓN REQUERIDA: Didit

## ⚠️ Error Actual

Estás viendo el error `Invalid workflow_id` porque las credenciales de Didit no están configuradas.

## 🔧 Pasos para Configurar (5 minutos)

### 1️⃣ Crear Cuenta en Didit

Ve a **[business.didit.me](https://business.didit.me/)** y crea tu cuenta gratuita.

### 2️⃣ Obtener API Key

1. En el dashboard de Didit, ve a **Verifications** (menú lateral)
2. Haz clic en el ícono **Settings (⚙️)** (esquina superior derecha)
3. Copia tu **API Key**

### 3️⃣ Crear Workflow

1. Ve a **Verifications → Workflows → Create New**
2. Selecciona la plantilla **KYC** (recomendado para verificación de identidad)
3. Guarda el workflow
4. Copia el **Workflow ID** de la lista

### 4️⃣ Configurar Webhook (Opcional pero recomendado)

1. Ve a **Verifications → Settings → API & Webhooks**
2. Agrega tu webhook URL: `https://tu-dominio.com/api/didit/webhook`
3. Copia el **Webhook Secret**

### 5️⃣ Actualizar `.env.local`

Edita el archivo `.env.local` en la raíz del proyecto:

```env
# Reemplaza estos valores con los reales de Didit
DIDIT_API_KEY=tu_api_key_real_aqui
DIDIT_WORKFLOW_ID=tu_workflow_id_real_aqui
DIDIT_WEBHOOK_SECRET=tu_webhook_secret_real_aqui
```

### 6️⃣ Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Vuelve a iniciar
npm run dev
```

## ✅ Verificar Configuración

Ejecuta este comando para verificar que todo está configurado:

```bash
npx tsx scripts/check-didit-config.ts
```

## 📚 Documentación Completa

Para más detalles, consulta: `.kiro/docs/didit-configuracion.md`

## 🆘 Soporte

Si tienes problemas:
- **WhatsApp Didit**: [+34 681 310 687](https://api.whatsapp.com/send/?phone=%2B34681310687)
- **Email Didit**: hello@didit.me
- **Docs**: [docs.didit.me](https://docs.didit.me/reference/introduction)

---

**Nota**: Didit ofrece un sandbox gratuito para pruebas. No necesitas tarjeta de crédito para empezar.
