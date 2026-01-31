/**
 * Script de Verificación de Rutas
 * 
 * Este script verifica que todas las rutas definidas en las constantes
 * correspondan a páginas reales en el sistema de archivos.
 */

import { ROUTES, AUTH_ROUTES, ROLE_CONFIG } from "@/lib/constants";
import fs from "fs";
import path from "path";

interface RouteCheck {
  route: string;
  exists: boolean;
  filePath: string;
}

const APP_DIR = path.join(process.cwd(), "app");

function checkRoute(route: string): RouteCheck {
  // Convertir ruta a path del sistema de archivos
  let filePath: string;
  
  if (route === "/") {
    // Ruta raíz puede estar en app/page.tsx o app/(public)/page.tsx
    const rootPage = path.join(APP_DIR, "page.tsx");
    const publicPage = path.join(APP_DIR, "(public)", "page.tsx");
    
    if (fs.existsSync(rootPage)) {
      return { route, exists: true, filePath: rootPage };
    } else if (fs.existsSync(publicPage)) {
      return { route, exists: true, filePath: publicPage };
    }
    return { route, exists: false, filePath: "N/A" };
  }
  
  // Intentar encontrar la página en diferentes ubicaciones
  const segments = route.split("/").filter(Boolean);
  
  // Intentar en app/(public)/...
  const publicPath = path.join(APP_DIR, "(public)", ...segments, "page.tsx");
  if (fs.existsSync(publicPath)) {
    return { route, exists: true, filePath: publicPath };
  }
  
  // Intentar en app/(auth)/...
  const authPath = path.join(APP_DIR, "(auth)", ...segments, "page.tsx");
  if (fs.existsSync(authPath)) {
    return { route, exists: true, filePath: authPath };
  }
  
  // Intentar en app/...
  const directPath = path.join(APP_DIR, ...segments, "page.tsx");
  if (fs.existsSync(directPath)) {
    return { route, exists: true, filePath: directPath };
  }
  
  return { route, exists: false, filePath: "N/A" };
}

console.log("🔍 Verificando Rutas de Red-Salud\n");
console.log("=".repeat(60));

// Verificar ROUTES
console.log("\n📄 Rutas Públicas (ROUTES):");
console.log("-".repeat(60));
const routeChecks: RouteCheck[] = [];
for (const [key, route] of Object.entries(ROUTES)) {
  const check = checkRoute(route);
  routeChecks.push(check);
  const status = check.exists ? "✅" : "❌";
  console.log(`${status} ${key.padEnd(15)} → ${route}`);
  if (!check.exists) {
    console.log(`   ⚠️  No se encontró: ${check.filePath}`);
  }
}

// Verificar AUTH_ROUTES
console.log("\n🔐 Rutas de Autenticación (AUTH_ROUTES):");
console.log("-".repeat(60));
const authChecks: RouteCheck[] = [];
for (const [key, route] of Object.entries(AUTH_ROUTES)) {
  const check = checkRoute(route);
  authChecks.push(check);
  const status = check.exists ? "✅" : "❌";
  console.log(`${status} ${key.padEnd(15)} → ${route}`);
  if (!check.exists) {
    console.log(`   ⚠️  No se encontró: ${check.filePath}`);
  }
}

// Verificar Dashboard Routes
console.log("\n🏥 Rutas de Dashboard (ROLE_CONFIG):");
console.log("-".repeat(60));
const dashboardChecks: RouteCheck[] = [];
for (const [key, config] of Object.entries(ROLE_CONFIG)) {
  const check = checkRoute(config.dashboardPath);
  dashboardChecks.push(check);
  const status = check.exists ? "✅" : "❌";
  console.log(`${status} ${key.padEnd(15)} → ${config.dashboardPath}`);
  if (!check.exists) {
    console.log(`   ⚠️  No se encontró: ${check.filePath}`);
  }
}

// Verificar rutas de servicios específicos
console.log("\n🏥 Rutas de Servicios Específicos:");
console.log("-".repeat(60));
const servicios = [
  "/servicios/pacientes",
  "/servicios/medicos",
  "/servicios/clinicas",
  "/servicios/laboratorios",
  "/servicios/farmacias",
  "/servicios/ambulancias",
  "/servicios/seguros",
];
const servicioChecks: RouteCheck[] = [];
for (const route of servicios) {
  const check = checkRoute(route);
  servicioChecks.push(check);
  const status = check.exists ? "✅" : "❌";
  console.log(`${status} ${route}`);
  if (!check.exists) {
    console.log(`   ⚠️  No se encontró: ${check.filePath}`);
  }
}

// Verificar rutas de registro por rol
console.log("\n📝 Rutas de Registro por Rol:");
console.log("-".repeat(60));
const registerRoutes = [
  "/register/paciente",
  "/register/medico",
  "/register/farmacia",
  "/register/laboratorio",
  "/register/clinica",
  "/register/ambulancia",
  "/register/seguro",
];
const registerChecks: RouteCheck[] = [];
for (const route of registerRoutes) {
  const check = checkRoute(route);
  registerChecks.push(check);
  const status = check.exists ? "✅" : "❌";
  console.log(`${status} ${route}`);
  if (!check.exists) {
    console.log(`   ⚠️  No se encontró: ${check.filePath}`);
  }
}

// Resumen
console.log("\n" + "=".repeat(60));
console.log("📊 Resumen:");
console.log("-".repeat(60));

const allChecks = [
  ...routeChecks,
  ...authChecks,
  ...dashboardChecks,
  ...servicioChecks,
  ...registerChecks,
];

const totalRoutes = allChecks.length;
const existingRoutes = allChecks.filter((c) => c.exists).length;
const missingRoutes = totalRoutes - existingRoutes;

console.log(`Total de rutas verificadas: ${totalRoutes}`);
console.log(`✅ Rutas existentes: ${existingRoutes}`);
console.log(`❌ Rutas faltantes: ${missingRoutes}`);

if (missingRoutes > 0) {
  console.log("\n⚠️  ADVERTENCIA: Hay rutas faltantes que necesitan ser creadas.");
  process.exit(1);
} else {
  console.log("\n✅ Todas las rutas están correctamente configuradas!");
  process.exit(0);
}
