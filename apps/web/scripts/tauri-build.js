/**
 * Script para build de Tauri
 * Runs Next.js build with TAURI_EXPORT flag
 */
const { execSync } = require('child_process');
const path = require('path');

async function main() {
    try {
        console.log('🔨 Building Next.js for Tauri static export...');
        console.log('⚠️  API routes will be excluded from the build.\n');

        execSync('cross-env TAURI_EXPORT=true next build', {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });

        console.log('\n✅ Next.js build completed successfully!');
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

main();
