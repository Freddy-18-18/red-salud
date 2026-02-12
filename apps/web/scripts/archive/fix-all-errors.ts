#!/usr/bin/env ts-node
/**
 * Script para corregir automáticamente errores comunes de ESLint y TypeScript
 */

import * as fs from 'fs';
import { glob } from 'glob';

interface Fix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const fixes: Fix[] = [
  // Fix 1: Replace @ts-ignore with @ts-expect-error
  {
    pattern: /\/\/ @ts-ignore/g,
    replacement: '// @ts-expect-error',
    description: 'Replace @ts-ignore with @ts-expect-error'
  },

  // Fix 2: Replace 'any' with 'unknown' in error handlers
  {
    pattern: /error,\s*setError\]\s*=\s*useState<any>\(null\)/g,
    replacement: 'error, setError] = useState<string | null>(null)',
    description: 'Replace any with string | null for error state'
  },

  // Fix 3: Remove unused variables with underscore prefix
  {
    pattern: /const\s+(_\w+)\s*=/g,
    replacement: 'const $1 =',
    description: 'Keep underscore prefix for unused variables'
  },
];

async function fixFile(filePath: string): Promise<number> {
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixCount = 0;

  for (const fix of fixes) {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      fixCount += matches.length;
    }
  }

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed ${fixCount} issues in ${filePath}`);
  }

  return fixCount;
}

async function main() {
  console.log('🔧 Starting automatic error fixes...\n');

  const patterns = [
    'hooks/**/*.ts',
    'hooks/**/*.tsx',
    'lib/**/*.ts',
    'lib/**/*.tsx',
    'components/**/*.ts',
    'components/**/*.tsx',
  ];

  let totalFixes = 0;

  for (const pattern of patterns) {
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/*.d.ts'] });

    for (const file of files) {
      const fixes = await fixFile(file);
      totalFixes += fixes;
    }
  }

  console.log(`\n✅ Total fixes applied: ${totalFixes}`);
  console.log('\n📝 Next steps:');
  console.log('1. Run: npm run lint -- --fix');
  console.log('2. Run: npx tsc --noEmit');
  console.log('3. Review and commit changes');
}

main().catch(console.error);
