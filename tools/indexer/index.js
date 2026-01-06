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
const repoMapGeneratedPath = path.join(repoRoot, 'docs', 'repo-map.generated.md');

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

function maxMtimeMs(files) {
  let max = 0;
  for (const filePath of files) {
    try {
      const { mtimeMs } = fs.statSync(filePath);
      if (mtimeMs > max) max = mtimeMs;
    } catch {
      // ignore
    }
  }
  return max;
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

function existsRel(relPath) {
  return fs.existsSync(path.join(repoRoot, relPath));
}

function listTopLevelDirs() {
  let entries;
  try {
    entries = fs.readdirSync(repoRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => !IGNORE_DIRS.has(name))
    .filter((name) => name !== '.githooks')
    .filter((name) => !name.startsWith('.'))
    .sort((a, b) => a.localeCompare(b));
}

function buildRepoMapMarkdown(knowledge, outputs) {
  const lines = [];
  lines.push('# Repo Map (Generated)');
  lines.push('');
  lines.push('Bu dosya `node tools/indexer/index.js` tarafından üretilir. Elle düzenlemeyin.');
  lines.push('');
  lines.push('## Meta');
  lines.push('');
  lines.push(`- Generated at (deterministic): \`${knowledge.generatedAt}\``);
  lines.push(`- Scanned roots: ${knowledge.scannedRoots.map((r) => `\`${r}\``).join(', ')}`);
  lines.push(`- TS file count: \`${knowledge.tsFileCount}\``);
  lines.push('');
  lines.push('## Top-Level Dirs');
  lines.push('');
  for (const dirName of listTopLevelDirs()) lines.push(`- \`${dirName}/\``);
  lines.push('');
  lines.push('## Entrypoints (Detected)');
  lines.push('');
  const candidateEntrypoints = [
    'main.ts',
    'main.js',
    'src/main.ts',
    'src/app/app.module.ts',
    'src/app/app-routing.module.ts',
    'webpack.config.js',
    'electron-builder.json',
  ].filter(existsRel);
  for (const p of candidateEntrypoints) lines.push(`- \`${p}\``);
  lines.push('');
  lines.push('## Knowledge Index');
  lines.push('');
  lines.push(`- \`docs/knowledge/components.json\` (items: ${outputs.components.items.length})`);
  lines.push(`- \`docs/knowledge/services.json\` (items: ${outputs.services.items.length})`);
  lines.push(`- \`docs/knowledge/modules.json\` (items: ${outputs.modules.items.length})`);
  lines.push(`- \`docs/knowledge/imports-graph.json\` (edges: ${outputs.importsGraph.edges.length})`);
  lines.push('');

  // Lightweight imports graph summary: top importers
  const byFrom = new Map();
  for (const edge of outputs.importsGraph.edges) {
    byFrom.set(edge.from, (byFrom.get(edge.from) || 0) + 1);
  }
  const topImporters = Array.from(byFrom.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  lines.push('## Imports Graph (Top Importers)');
  lines.push('');
  if (topImporters.length === 0) {
    lines.push('- (no edges)');
  } else {
    for (const [from, count] of topImporters) lines.push(`- \`${from}\` → \`${count}\` imports`);
  }
  lines.push('');

  return lines.join('\n');
}

function main() {
  const isCheck = process.argv.includes('--check');

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

  const generatedAtMs = maxMtimeMs(tsFiles);
  const knowledge = {
    generatedAt: new Date(generatedAtMs || 0).toISOString(),
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

  const outputs = {
    components: componentsOut,
    services: servicesOut,
    modules: modulesOut,
    importsGraph: importsGraphOut,
  };

  const jsonByPath = new Map([
    [outFiles.components, JSON.stringify(componentsOut, null, 2) + '\n'],
    [outFiles.services, JSON.stringify(servicesOut, null, 2) + '\n'],
    [outFiles.modules, JSON.stringify(modulesOut, null, 2) + '\n'],
    [outFiles.importsGraph, JSON.stringify(importsGraphOut, null, 2) + '\n'],
  ]);

  if (isCheck) {
    const mismatches = [];
    for (const [filePath, expected] of jsonByPath.entries()) {
      const current = readFileSafe(filePath);
      if (current !== expected) mismatches.push(path.relative(repoRoot, filePath));
    }
    if (mismatches.length > 0) {
      console.error('Indexer check failed. Out-of-date files:');
      for (const p of mismatches) console.error(`- ${p}`);
      process.exit(1);
    }
    process.exit(0);
  }

  ensureDir(outDir);
  for (const [filePath, content] of jsonByPath.entries()) fs.writeFileSync(filePath, content);

  ensureDir(path.dirname(repoMapGeneratedPath));
  fs.writeFileSync(repoMapGeneratedPath, buildRepoMapMarkdown(knowledge, outputs) + '\n');

  console.log('Indexer complete.');
  console.log(`- ${path.relative(repoRoot, outFiles.components)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.services)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.modules)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.importsGraph)}`);
  console.log(`- ${path.relative(repoRoot, repoMapGeneratedPath)}`);
}

main();
