#!/usr/bin/env node
/**
 * Verification Script: File Size Compliance
 * 
 * Scans the codebase and reports all source files exceeding 400 lines.
 * Used to enforce the file size requirement during project restructuring.
 */

import * as fs from 'fs';
import * as path from 'path';

interface FileReport {
  path: string;
  lines: number;
  exceeds: boolean;
}

interface SizeReport {
  timestamp: string;
  totalFiles: number;
  filesOverLimit: number;
  averageLines: number;
  maxLines: number;
  files: FileReport[];
}

const MAX_LINES = 400;
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

/**
 * Count lines in a file
 */
function countLines(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return 0;
  }
}

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
 * Recursively scan directory for source files
 */
function scanDirectory(dirPath: string, files: FileReport[] = []): FileReport[] {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!shouldExcludeDir(fullPath)) {
          scanDirectory(fullPath, files);
        }
      } else if (entry.isFile() && shouldAnalyzeFile(fullPath)) {
        const lines = countLines(fullPath);
        files.push({
          path: fullPath,
          lines,
          exceeds: lines > MAX_LINES,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Generate size report
 */
function generateReport(files: FileReport[]): SizeReport {
  const filesOverLimit = files.filter(f => f.exceeds);
  const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
  const averageLines = files.length > 0 ? Math.round(totalLines / files.length) : 0;
  const maxLines = files.length > 0 ? Math.max(...files.map(f => f.lines)) : 0;

  return {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    filesOverLimit: filesOverLimit.length,
    averageLines,
    maxLines,
    files: filesOverLimit.sort((a, b) => b.lines - a.lines),
  };
}

/**
 * Format report as text
 */
function formatReport(report: SizeReport): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(80));
  lines.push('FILE SIZE VERIFICATION REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push(`Maximum allowed lines: ${MAX_LINES}`);
  lines.push('');
  lines.push('SUMMARY');
  lines.push('-'.repeat(80));
  lines.push(`Total files analyzed: ${report.totalFiles}`);
  lines.push(`Files exceeding limit: ${report.filesOverLimit}`);
  lines.push(`Average file size: ${report.averageLines} lines`);
  lines.push(`Largest file: ${report.maxLines} lines`);
  lines.push('');

  if (report.filesOverLimit > 0) {
    lines.push('FILES EXCEEDING LIMIT');
    lines.push('-'.repeat(80));
    lines.push('');

    for (const file of report.files) {
      const excess = file.lines - MAX_LINES;
      lines.push(`${file.path}`);
      lines.push(`  Lines: ${file.lines} (${excess} over limit)`);
      lines.push('');
    }

    lines.push('='.repeat(80));
    lines.push(`RESULT: FAILED - ${report.filesOverLimit} file(s) exceed the limit`);
    lines.push('='.repeat(80));
  } else {
    lines.push('='.repeat(80));
    lines.push('RESULT: PASSED - All files are within the limit');
    lines.push('='.repeat(80));
  }

  return lines.join('\n');
}

/**
 * Main execution
 */
function main() {
  console.log('Scanning codebase for file size compliance...\n');

  const rootDir = process.cwd();
  const files = scanDirectory(rootDir);
  const report = generateReport(files);
  const output = formatReport(report);

  console.log(output);

  // Save report to file
  const reportPath = path.join(rootDir, '.kiro', 'specs', 'project-restructuring', 'file-size-report.txt');
  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, output, 'utf-8');
    console.log(`\nReport saved to: ${reportPath}`);
  } catch (error) {
    console.error('Error saving report:', error);
  }

  // Exit with error code if files exceed limit
  process.exit(report.filesOverLimit > 0 ? 1 : 0);
}

main();
