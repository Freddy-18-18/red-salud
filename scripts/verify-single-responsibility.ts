/**
 * Verification Script: Single Responsibility Analysis
 *
 * Analiza archivos para detectar posibles violaciones del Principio de Responsabilidad Única.
 * Heurísticas simples: tamaño, mezcla de JSX + lógica, número de exports, etc.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ResponsibilityIndicator {
  type: string;
  count: number;
  examples: string[];
}

interface FileAnalysis {
  path: string;
  size: number;
  indicators: ResponsibilityIndicator[];
  suggestions: string[];
}

const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

function isCodeFile(file: string) {
  return CODE_EXTENSIONS.some((ext) => file.endsWith(ext));
}

function walk(dir: string, acc: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(full, acc);
    } else if (isCodeFile(e.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function analyzeFile(filePath: string): FileAnalysis {
  const content = fs.readFileSync(filePath, 'utf8');
  const size = content.split('\n').length;

  const indicators: ResponsibilityIndicator[] = [];
  const suggestions: string[] = [];

  // Heurísticas simples
  const importMatches = content.match(/^import\s/mg) || [];
  const exportMatches = content.match(/^export\s/mg) || [];
  const jsxMatches = content.match(/<\w+[^>]*>/g) || [];
  const useEffectMatches = content.match(/useEffect\(/g) || [];
  const useStateMatches = content.match(/useState\(/g) || [];
  const serviceHints = content.match(/from\s+['\"][\.\/]lib|service|supabase|api/gi) || [];

  indicators.push({ type: 'imports', count: importMatches.length, examples: [] });
  indicators.push({ type: 'exports', count: exportMatches.length, examples: [] });
  indicators.push({ type: 'jsx_blocks', count: jsxMatches.length, examples: jsxMatches.slice(0, 3) });
  indicators.push({ type: 'use_effects', count: useEffectMatches.length, examples: [] });
  indicators.push({ type: 'use_state', count: useStateMatches.length, examples: [] });
  indicators.push({ type: 'data_service_refs', count: serviceHints.length, examples: serviceHints.slice(0, 3) });

  if (size > 400) {
    suggestions.push('Archivo supera 400 líneas: dividir en módulos más pequeños.');
  }
  if (jsxMatches.length > 0 && (useEffectMatches.length > 0 || serviceHints.length > 0)) {
    suggestions.push('Separar presentación (JSX) de lógica/servicios en hooks o servicios dedicados.');
  }
  if (exportMatches.length > 4) {
    suggestions.push('Demasiados exports: considerar dividir en múltiples archivos por responsabilidad.');
  }

  return { path: filePath, size, indicators, suggestions };
}

function main() {
  const root = process.cwd();
  const paths = walk(root);
  const analyses = paths.map(analyzeFile);
  const flagged = analyses.filter((a) => a.suggestions.length > 0);

  const report = {
    root,
    analyzed: analyses.length,
    flagged: flagged.length,
    files: flagged,
  };

  const asJson = process.argv.includes('--json');
  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Analizados: ${report.analyzed} | Con sugerencias: ${report.flagged}`);
    for (const f of flagged.slice(0, 50)) {
      console.log(`\n- ${path.relative(root, f.path)} (${f.size} líneas)`);
      for (const s of f.suggestions) console.log(`  • ${s}`);
    }
    if (flagged.length > 50) console.log(`\n... ${flagged.length - 50} archivos adicionales omitidos`);
  }
}

main();