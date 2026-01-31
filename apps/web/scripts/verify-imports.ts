#!/usr/bin/env node
/**
 * Verification Script: Import Path Integrity
 * 
 * Checks for broken import paths in the codebase.
 * Validates that all imported files exist and paths are correct.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ImportStatement {
  file: string;
  line: number;
  importPath: string;
  resolvedPath: string | null;
  exists: boolean;
}

interface ImportReport {
  timestamp: string;
  totalFiles: number;
  totalImports: number;
  brokenImports: number;
  imports: ImportStatement[];
}

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vercel',
  '.idea',
  '.vscode',
];

// Import regex patterns
const IMPORT_PATTERNS = [
  /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
  /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath: string): boolean {
  const dirName = path.basename(dirPath);
  return EXCLUDE_DIRS.includes(dirName);
}

/**
 * Check if file should be analyzed
 */
function shouldAnalyzeFile(filePath: string): boolean {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext);
}

/**
 * Extract import statements from file content
 */
function extractImports(filePath: string, content: string): ImportStatement[] {
  const imports: ImportStatement[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    for (const pattern of IMPORT_PATTERNS) {
      const matches = [...line.matchAll(pattern)];
      for (const match of matches) {
        const importPath = match[1];
        
        // Skip external packages (not starting with . or @/)
        if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
          continue;
        }

        const resolvedPath = resolveImportPath(filePath, importPath);
        const exists = resolvedPath ? fs.existsSync(resolvedPath) : false;

        imports.push({
          file: filePath,
          line: index + 1,
          importPath,
          resolvedPath,
          exists,
        });
      }
    }
  });

  return imports;
}

/**
 * Resolve import path to actual file path
 */
function resolveImportPath(fromFile: string, importPath: string): string | null {
  const rootDir = process.cwd();
  
  try {
    // Handle @/ alias
    if (importPath.startsWith('@/')) {
      const relativePath = importPath.substring(2);
      return resolveWithExtensions(path.join(rootDir, relativePath));
    }

    // Handle relative imports
    if (importPath.startsWith('.')) {
      const fromDir = path.dirname(fromFile);
      const absolutePath = path.resolve(fromDir, importPath);
      return resolveWithExtensions(absolutePath);
    }
  } catch (error) {
    return null;
  }

  return null;
}

/**
 * Try to resolve path with different extensions
 */
function resolveWithExtensions(basePath: string): string | null {
  // Try exact path first
  if (fs.existsSync(basePath)) {
    const stat = fs.statSync(basePath);
    if (stat.isFile()) {
      return basePath;
    }
    // If directory, try index files
    for (const ext of EXTENSIONS) {
      const indexPath = path.join(basePath, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
  }

  // Try with extensions
  for (const ext of EXTENSIONS) {
    const pathWithExt = `${basePath}${ext}`;
    if (fs.existsSync(pathWithExt)) {
      return pathWithExt;
    }
  }

  return null;
}

/**
 * Recursively scan directory for source files
 */
function scanDirectory(dirPath: string, imports: ImportStatement[] = []): ImportStatement[] {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!shouldExcludeDir(fullPath)) {
          scanDirectory(fullPath, imports);
        }
      } else if (entry.isFile() && shouldAnalyzeFile(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const fileImports = extractImports(fullPath, content);
          imports.push(...fileImports);
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return imports;
}

/**
 * Generate import report
 */
function generateReport(imports: ImportStatement[]): ImportReport {
  const brokenImports = imports.filter(i => !i.exists);
  const uniqueFiles = new Set(imports.map(i => i.file));

  return {
    timestamp: new Date().toISOString(),
    totalFiles: uniqueFiles.size,
    totalImports: imports.length,
    brokenImports: brokenImports.length,
    imports: brokenImports,
  };
}

/**
 * Format report as text
 */
function formatReport(report: ImportReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('IMPORT PATH INTEGRITY VERIFICATION REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Total files analyzed: ${report.totalFiles}`);
  lines.push(`Total imports found: ${report.totalImports}`);
  lines.push(`Broken imports: ${report.brokenImports}`);
  lines.push('');

  if (report.brokenImports > 0) {
    lines.push('BROKEN IMPORTS');
    lines.push('-'.repeat(80));
    lines.push('');

    // Group by file
    const byFile = new Map<string, ImportStatement[]>();
    for (const imp of report.imports) {
      if (!byFile.has(imp.file)) {
        byFile.set(imp.file, []);
      }
      byFile.get(imp.file)!.push(imp);
    }

    for (const [file, fileImports] of byFile) {
      lines.push(`${file}`);
      for (const imp of fileImports) {
        lines.push(`  Line ${imp.line}: "${imp.importPath}"`);
        if (imp.resolvedPath) {
          lines.push(`    Resolved to: ${imp.resolvedPath} (NOT FOUND)`);
        } else {
          lines.push(`    Could not resolve path`);
        }
      }
      lines.push('');
    }

    lines.push('='.repeat(80));
    lines.push(`RESULT: FAILED - ${report.brokenImports} broken import(s) found`);
    lines.push('='.repeat(80));
  } else {
    lines.push('='.repeat(80));
    lines.push('RESULT: PASSED - All imports are valid');
    lines.push('='.repeat(80));
  }

  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('Scanning codebase for import path integrity...\n');

  const rootDir = process.cwd();
  const imports = scanDirectory(rootDir);
  const report = generateReport(imports);
  const output = formatReport(report);

  console.log(output);

  // Save report to file
  const reportPath = path.join(rootDir, '.kiro', 'specs', 'project-restructuring', 'import-integrity-report.txt');
  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, output, 'utf-8');
    console.log(`\nReport saved to: ${reportPath}`);
  } catch (error) {
    console.error('Error saving report:', error);
  }

  // Exit with error code if broken imports found
  process.exit(report.brokenImports > 0 ? 1 : 0);
}

main();
