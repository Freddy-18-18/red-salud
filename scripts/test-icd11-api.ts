/**
 * Script de prueba para la API de ICD-11
 * 
 * Uso:
 * npx tsx scripts/test-icd11-api.ts
 * 
 * O con Node.js:
 * node --loader ts-node/esm scripts/test-icd11-api.ts
 */

import { 
  searchICD11, 
  searchICD11ByCode, 
  validateICD11Code,
  getICD11Suggestions 
} from "../lib/services/icd-api-service";

async function testICD11API() {
  console.log("🧪 Iniciando pruebas de ICD-11 API...\n");

  try {
    // Test 1: Búsqueda general
    console.log("📋 Test 1: Búsqueda de 'diabetes'");
    const diabetesResults = await searchICD11("diabetes");
    console.log(`✅ Encontrados ${diabetesResults.length} resultados`);
    if (diabetesResults.length > 0) {
      console.log("   Primer resultado:", {
        code: diabetesResults[0].code,
        title: diabetesResults[0].title,
        chapter: diabetesResults[0].chapter,
      });
    }
    console.log("");

    // Test 2: Búsqueda de sugerencias
    console.log("📋 Test 2: Sugerencias para 'hipertensión'");
    const hypertensionSuggestions = await getICD11Suggestions("hipertensión");
    console.log(`✅ Encontradas ${hypertensionSuggestions.length} sugerencias`);
    if (hypertensionSuggestions.length > 0) {
      console.log("   Primeras 3 sugerencias:");
      hypertensionSuggestions.slice(0, 3).forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.code} - ${s.title}`);
      });
    }
    console.log("");

    // Test 3: Búsqueda por código específico
    console.log("📋 Test 3: Búsqueda por código '5A11' (Diabetes tipo 2)");
    const codeResult = await searchICD11ByCode("5A11");
    if (codeResult) {
      console.log("✅ Código encontrado:", {
        code: codeResult.code,
        title: codeResult.title,
      });
    } else {
      console.log("❌ Código no encontrado");
    }
    console.log("");

    // Test 4: Validación de código
    console.log("📋 Test 4: Validar código '5A11'");
    const isValid = await validateICD11Code("5A11");
    console.log(isValid ? "✅ Código válido" : "❌ Código inválido");
    console.log("");

    // Test 5: Búsqueda en español
    console.log("📋 Test 5: Búsqueda de términos en español");
    const spanishTerms = ["asma", "neumonía", "gripe", "covid"];
    for (const term of spanishTerms) {
      const results = await searchICD11(term);
      console.log(`   ${term}: ${results.length} resultados`);
      if (results.length > 0) {
        console.log(`      → ${results[0].code} - ${results[0].title}`);
      }
    }
    console.log("");

    // Test 6: Búsqueda con caracteres especiales
    console.log("📋 Test 6: Búsqueda con tildes y ñ");
    const accentResults = await searchICD11("infección");
    console.log(`✅ Encontrados ${accentResults.length} resultados para 'infección'`);
    console.log("");

    console.log("✨ Todas las pruebas completadas exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("credentials not configured")) {
        console.log("\n⚠️  Asegúrate de configurar las variables de entorno:");
        console.log("   ICD_API_CLIENT_ID");
        console.log("   ICD_API_CLIENT_SECRET");
        console.log("\n   Cópialas desde .env.example a .env.local");
      }
    }
    
    process.exit(1);
  }
}

// Ejecutar pruebas
testICD11API();
