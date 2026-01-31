/**
 * Script para verificar la configuración de Didit
 * Ejecutar con: npx tsx scripts/check-didit-config.ts
 */

const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;
const DIDIT_WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET;

console.log("\n🔍 Verificando configuración de Didit...\n");

let hasErrors = false;

// Verificar API Key
if (!DIDIT_API_KEY || DIDIT_API_KEY === "tu_api_key_aqui") {
  console.log("❌ DIDIT_API_KEY no está configurada o usa el valor placeholder");
  console.log("   → Ve a: https://business.didit.me/");
  console.log("   → Navega a: Verifications → Settings (⚙️)");
  console.log("   → Copia tu API Key\n");
  hasErrors = true;
} else {
  console.log("✅ DIDIT_API_KEY configurada");
  console.log(`   → ${DIDIT_API_KEY.substring(0, 10)}...${DIDIT_API_KEY.substring(DIDIT_API_KEY.length - 5)}\n`);
}

// Verificar Workflow ID
if (!DIDIT_WORKFLOW_ID || DIDIT_WORKFLOW_ID === "tu_workflow_id_aqui") {
  console.log("❌ DIDIT_WORKFLOW_ID no está configurada o usa el valor placeholder");
  console.log("   → Ve a: https://business.didit.me/");
  console.log("   → Navega a: Verifications → Workflows");
  console.log("   → Crea un workflow (recomendado: KYC template)");
  console.log("   → Copia el Workflow ID\n");
  hasErrors = true;
} else {
  console.log("✅ DIDIT_WORKFLOW_ID configurada");
  console.log(`   → ${DIDIT_WORKFLOW_ID}\n`);
}

// Verificar Webhook Secret
if (!DIDIT_WEBHOOK_SECRET || DIDIT_WEBHOOK_SECRET === "tu_webhook_secret_aqui") {
  console.log("⚠️  DIDIT_WEBHOOK_SECRET no está configurada o usa el valor placeholder");
  console.log("   → Ve a: https://business.didit.me/");
  console.log("   → Navega a: Verifications → Settings → API & Webhooks");
  console.log("   → Configura tu webhook URL y copia el secret\n");
  hasErrors = true;
} else {
  console.log("✅ DIDIT_WEBHOOK_SECRET configurada");
  console.log(`   → ${DIDIT_WEBHOOK_SECRET.substring(0, 10)}...${DIDIT_WEBHOOK_SECRET.substring(DIDIT_WEBHOOK_SECRET.length - 5)}\n`);
}

if (hasErrors) {
  console.log("❌ Hay errores en la configuración de Didit");
  console.log("\n📚 Consulta la documentación en: .kiro/docs/didit-configuracion.md\n");
  process.exit(1);
} else {
  console.log("✅ Configuración de Didit completa\n");
  console.log("🚀 Puedes probar la integración iniciando una verificación desde el dashboard\n");
  process.exit(0);
}
