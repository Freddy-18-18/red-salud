import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = path.resolve(__dirname, '../../');
const WEB_DIR = path.resolve(__dirname, '../');

console.log('🔍 Verificando configuración del Workspace...');

function checkEnv() {
    const envPath = path.join(WEB_DIR, '.env.local');
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️  Falta el archivo .env.local en apps/web. Algunos servicios podrían fallar.');
        return false;
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missing = required.filter(key => !content.includes(key));
    if (missing.length > 0) {
        console.warn(`⚠️  Faltan variables en .env.local: ${missing.join(', ')}`);
        return false;
    }

    console.log('✅ .env.local configurado correctamente.');
    return true;
}

function checkDependencies() {
    try {
        console.log('📦 Verificando dependencias (pnpm)...');
        execSync('pnpm --version', { stdio: 'ignore' });
        console.log('✅ pnpm está instalado.');
        return true;
    } catch (e) {
        console.error('❌ pnpm no se encuentra instalado.');
        return false;
    }
}

function checkCriticalFiles() {
    const files = [
        'apps/web/lib/supabase/client.ts',
        'apps/web/lib/supabase/server.ts',
        'packages/types/index.ts',
        'packages/design-system/index.ts'
    ];

    let allFound = true;
    files.forEach(f => {
        if (!fs.existsSync(path.join(ROOT_DIR, f))) {
            console.error(`❌ Archivo crítico faltante: ${f}`);
            allFound = false;
        }
    });

    if (allFound) console.log('✅ Archivos críticos verificados.');
    return allFound;
}

async function main() {
    const envOk = checkEnv();
    const depsOk = checkDependencies();
    const filesOk = checkCriticalFiles();

    console.log('\n--- Resumen de Verificación ---');
    if (envOk && depsOk && filesOk) {
        console.log('🚀 Workspace listo para desarrollo.');
    } else {
        console.warn('⚠️  Se encontraron problemas menores. Revisa los mensajes anteriores.');
    }
}

main().catch(console.error);
