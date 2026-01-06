#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const srcRoots = [path.join(repoRoot, 'src'), path.join(repoRoot, 'main')];

const outDir = path.join(repoRoot, 'docs', 'knowledge');
const outFiles = {
  components: path.join(outDir, 'components.json'),
  services: path.join(outDir, 'services.json'),
  modules: path.join(outDir, 'modules.json'),
  importsGraph: path.join(outDir, 'imports-graph.json'),
};

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  'app-builds',
  '.git',
  '.angular',
  'coverage',
]);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isTsFile(filePath) {
  return filePath.endsWith('.ts') && !filePath.endsWith('.d.ts');
}

function walk(dirPath, files) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(fullPath, files);
      continue;
    }
    if (entry.isFile() && isTsFile(fullPath)) files.push(fullPath);
  }
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function normalizeRel(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function uniqueSorted(items, keyFn) {
  const map = new Map();
  for (const item of items) map.set(keyFn(item), item);
  return Array.from(map.values()).sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
}

function extractImports(tsText) {
  const results = [];

  // import ... from '...'
  const importRe = /import\s+[^;]*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRe.exec(tsText))) results.push(match[1]);

  // require('...')
  const requireRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRe.exec(tsText))) results.push(match[1]);

  return results;
}

function extractDecoratorBlocks(tsText, decoratorName) {
  // Heuristic: capture "@Xxx({ ... })" blocks without trying to fully parse TS.
  // Works for common Angular patterns in this repo.
  const results = [];
  const re = new RegExp(`@${decoratorName}\\s*\\(\\s*\\{`, 'g');
  let match;
  while ((match = re.exec(tsText))) {
    const start = match.index;
    let i = match.index + match[0].length;
    let depth = 1;
    for (; i < tsText.length; i++) {
      const ch = tsText[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth === 0) break;
    }
    if (depth === 0) {
      const block = tsText.slice(start, i + 1);
      results.push(block);
      re.lastIndex = i + 1;
    } else {
      break;
    }
  }
  return results;
}

function findDecoratorOccurrences(tsText, decoratorName) {
  const indices = [];
  const re = new RegExp(`@${decoratorName}\\b`, 'g');
  let match;
  while ((match = re.exec(tsText))) indices.push(match.index);
  return indices;
}

function findNearestExportedClass(tsText, afterIndex) {
  const tail = tsText.slice(afterIndex);
  const classRe = /export\s+class\s+([A-Za-z0-9_]+)/;
  const match = classRe.exec(tail);
  return match ? match[1] : null;
}

function extractSelectorFromComponentBlock(blockText) {
  const m = /selector\s*:\s*['"]([^'"]+)['"]/.exec(blockText);
  return m ? m[1] : null;
}

function main() {
  const tsFiles = [];
  for (const root of srcRoots) walk(root, tsFiles);

  const components = [];
  const services = [];
  const modules = [];
  const importEdges = [];

  for (const absPath of tsFiles) {
    const relPath = normalizeRel(absPath);
    const text = readFileSafe(absPath);

    // Imports graph (only local-ish + package names; keep raw string)
    for (const spec of extractImports(text)) {
      importEdges.push({ from: relPath, import: spec });
    }

    // Components
    const componentBlocks = extractDecoratorBlocks(text, 'Component');
    for (const block of componentBlocks) {
      const selector = extractSelectorFromComponentBlock(block);
      const className = findNearestExportedClass(text, text.indexOf(block) + block.length);
      components.push({
        file: relPath,
        className: className || undefined,
        selector: selector || undefined,
      });
    }

    // Services / providers (@Injectable)
    // Many files use @Injectable() (no object literal), so we detect occurrences and bind them to the nearest exported class.
    const injectableIndices = findDecoratorOccurrences(text, 'Injectable');
    for (const idx of injectableIndices) {
      const className = findNearestExportedClass(text, idx);
      services.push({
        file: relPath,
        className: className || undefined,
        kind: 'Injectable',
      });
    }

    // NgModule
    const ngModuleBlocks = extractDecoratorBlocks(text, 'NgModule');
    for (const block of ngModuleBlocks) {
      const className = findNearestExportedClass(text, text.indexOf(block) + block.length);
      modules.push({
        file: relPath,
        className: className || undefined,
      });
    }
  }

  const knowledge = {
    generatedAt: new Date().toISOString(),
    scannedRoots: srcRoots.map(normalizeRel),
    tsFileCount: tsFiles.length,
  };

  ensureDir(outDir);

  const componentsOut = {
    ...knowledge,
    items: uniqueSorted(
      components.filter((c) => c.className || c.selector),
      (c) => `${c.file}:${c.className || ''}:${c.selector || ''}`
    ),
  };

  const servicesOut = {
    ...knowledge,
    items: uniqueSorted(
      services.filter((s) => s.className),
      (s) => `${s.file}:${s.className}`
    ),
  };

  const modulesOut = {
    ...knowledge,
    items: uniqueSorted(
      modules.filter((m) => m.className),
      (m) => `${m.file}:${m.className}`
    ),
  };

  const importsGraphOut = {
    ...knowledge,
    edges: uniqueSorted(importEdges, (e) => `${e.from}=>${e.import}`),
  };

  fs.writeFileSync(outFiles.components, JSON.stringify(componentsOut, null, 2) + '\n');
  fs.writeFileSync(outFiles.services, JSON.stringify(servicesOut, null, 2) + '\n');
  fs.writeFileSync(outFiles.modules, JSON.stringify(modulesOut, null, 2) + '\n');
  fs.writeFileSync(outFiles.importsGraph, JSON.stringify(importsGraphOut, null, 2) + '\n');

  console.log('Indexer complete.');
  console.log(`- ${path.relative(repoRoot, outFiles.components)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.services)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.modules)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.importsGraph)}`);
}

main();
