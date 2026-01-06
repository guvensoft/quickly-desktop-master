#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const repoRoot = path.resolve(__dirname, '../..');
const srcRoots = [path.join(repoRoot, 'src'), path.join(repoRoot, 'main')];

const outDir = path.join(repoRoot, 'docs', 'knowledge');
const outFiles = {
  components: path.join(outDir, 'components.json'),
  services: path.join(outDir, 'services.json'),
  modules: path.join(outDir, 'modules.json'),
  importsGraph: path.join(outDir, 'imports-graph.json'),
  symbols: path.join(outDir, 'symbols.json'),
  symbolsBySource: path.join(outDir, 'symbols.by-source.json'),
  sources: path.join(outDir, 'sources.json'),
};
const repoMapGeneratedPath = path.join(repoRoot, 'docs', 'repo-map.generated.md');
const packageJson = require(path.join(repoRoot, 'package.json'));
const repoName = packageJson.name || path.basename(repoRoot);

const tsconfigSources = [
  { id: 'app', tsconfig: 'src/tsconfig.app.json', kind: 'angular' },
  { id: 'electron', tsconfig: 'tsconfig.electron.json', kind: 'electron' },
  { id: 'spec', tsconfig: 'src/tsconfig.spec.json', kind: 'tests' },
  { id: 'e2e', tsconfig: 'e2e/tsconfig.e2e.json', kind: 'tests' },
  { id: 'root', tsconfig: 'tsconfig.json', kind: 'root' },
];

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

function parseJsonSafe(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readTsconfigHints(relPath) {
  const cfgPath = path.join(repoRoot, relPath);
  const json = parseJsonSafe(cfgPath);
  if (!json) return { includeHints: [], excludeHints: [] };
  const includeHints = Array.isArray(json.include) ? json.include.slice() : [];
  if (Array.isArray(json.files)) includeHints.push(...json.files);
  const excludeHints = Array.isArray(json.exclude) ? json.exclude.slice() : [];
  return {
    includeHints: includeHints.filter((hint) => typeof hint === 'string'),
    excludeHints: excludeHints.filter((hint) => typeof hint === 'string'),
  };
}

function buildSourcesMetadata() {
  return tsconfigSources
    .map((cfg) => {
      const hints = readTsconfigHints(cfg.tsconfig);
      return {
        id: cfg.id,
        tsconfig: cfg.tsconfig,
        kind: cfg.kind,
        includeHints: hints.includeHints.sort(),
        excludeHints: hints.excludeHints.sort(),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function determineSourceId(relPath) {
  const normalized = relPath || '';
  if (normalized === 'main.ts' || normalized.startsWith('main/')) return 'electron';
  if (normalized.startsWith('e2e/')) return 'e2e';
  if (normalized.startsWith('src/')) {
    if (normalized === 'src/test.ts' || normalized.includes('.spec.')) return 'spec';
    return 'app';
  }
  if (!normalized || normalized.startsWith('docs/') || normalized.startsWith('ops/') || normalized.startsWith('tasks/') || normalized.startsWith('tools/')) {
    return 'root';
  }
  return 'unknown';
}
function normalizeRel(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function hasModifier(node, kind) {
  return !!node.modifiers && node.modifiers.some((mod) => mod.kind === kind);
}

function isNodeExported(node) {
  return hasModifier(node, ts.SyntaxKind.ExportKeyword);
}

function getDecoratorNames(node) {
  if (!node.decorators) return [];
  const names = [];
  for (const decorator of node.decorators) {
    const expr = decorator.expression;
    if (!expr) continue;
    if (ts.isCallExpression(expr) && expr.expression) names.push(expr.expression.getText());
    else names.push(expr.getText());
  }
  return names;
}

function getHeritageNames(node, tokenKind) {
  if (!node.heritageClauses) return [];
  const clause = node.heritageClauses.find((h) => h.token === tokenKind);
  if (!clause) return [];
  return clause.types.map((t) => t.expression.getText());
}

function getAccessModifier(node) {
  if (hasModifier(node, ts.SyntaxKind.PrivateKeyword)) return 'private';
  if (hasModifier(node, ts.SyntaxKind.ProtectedKeyword)) return 'protected';
  if (hasModifier(node, ts.SyntaxKind.PublicKeyword)) return 'public';
  return 'public';
}

function getParamsInfo(parameters, sourceFile) {
  return parameters.map((param) => ({
    name: param.name ? param.name.getText(sourceFile) : 'param',
    type: param.type ? param.type.getText(sourceFile) : 'any',
    optional: !!param.questionToken,
  }));
}

function buildMemberInfo(member, sourceFile) {
  const kind = ts.isConstructorDeclaration(member)
    ? 'constructor'
    : ts.isMethodDeclaration(member) || ts.isMethodSignature(member)
    ? 'method'
    : 'property';
  const name =
    ts.isConstructorDeclaration(member) || !member.name
      ? 'constructor'
      : member.name.getText(sourceFile);
  const info = {
    kind,
    name,
    access: getAccessModifier(member),
    static: hasModifier(member, ts.SyntaxKind.StaticKeyword),
    async: hasModifier(member, ts.SyntaxKind.AsyncKeyword),
  };
  if (kind !== 'property') {
    info.params = getParamsInfo(member.parameters || [], sourceFile);
  } else {
    info.params = [];
  }
  if (member.type) info.returnType = member.type.getText(sourceFile);
  return info;
}

function buildClassExport(node, sourceFile) {
  const name = node.name ? node.name.getText(sourceFile) : 'default';
  const decorators = getDecoratorNames(node);
  const extendsClause = getHeritageNames(node, ts.SyntaxKind.ExtendsKeyword);
  const implementsClause = getHeritageNames(node, ts.SyntaxKind.ImplementsKeyword);
  const members = node.members
    .map((member) => buildMemberInfo(member, sourceFile))
    .filter(Boolean)
    .sort((a, b) => `${a.kind}:${a.name}`.localeCompare(`${b.kind}:${b.name}`));
  return {
    kind: 'class',
    name,
    decorators,
    extends: extendsClause[0],
    implements: implementsClause,
    members,
  };
}

function buildFunctionExport(node, sourceFile) {
  const name = node.name ? node.name.getText(sourceFile) : 'default';
  return {
    kind: 'function',
    name,
    params: getParamsInfo(node.parameters || [], sourceFile),
    returnType: node.type ? node.type.getText(sourceFile) : undefined,
  };
}

function buildInterfaceExport(node, sourceFile) {
  const members = node.members
    .map((member) => buildMemberInfo(member, sourceFile))
    .filter(Boolean)
    .sort((a, b) => `${a.kind}:${a.name}`.localeCompare(`${b.kind}:${b.name}`));
  return {
    kind: 'interface',
    name: node.name ? node.name.getText(sourceFile) : 'default',
    members,
  };
}

function buildEnumExport(node, sourceFile) {
  return {
    kind: 'enum',
    name: node.name ? node.name.getText(sourceFile) : 'default',
    members: node.members.map((member) => ({
      name: member.name.getText(sourceFile),
    })),
  };
}

function buildTypeAliasExport(node, sourceFile) {
  return {
    kind: 'type',
    name: node.name ? node.name.getText(sourceFile) : 'default',
    type: node.type ? node.type.getText(sourceFile) : undefined,
  };
}

function buildVariableExports(node, sourceFile) {
  const kind =
    node.declarationList.flags & ts.NodeFlags.Const
      ? 'const'
      : node.declarationList.flags & ts.NodeFlags.Let
      ? 'let'
      : 'var';
  return node.declarationList.declarations.map((decl) => ({
    kind,
    name: decl.name.getText(sourceFile),
    type: decl.type ? decl.type.getText(sourceFile) : undefined,
  }));
}

function collectSymbols(tsFiles) {
  const fileMap = new Map();
  for (const absPath of tsFiles) {
    const relPath = normalizeRel(absPath);
    const text = readFileSafe(absPath);
    const sourceFile = ts.createSourceFile(relPath, text, ts.ScriptTarget.Latest, true);
    const exports = [];

    function visit(node) {
      if (ts.isClassDeclaration(node) && isNodeExported(node)) {
        exports.push(buildClassExport(node, sourceFile));
      } else if (ts.isFunctionDeclaration(node) && isNodeExported(node)) {
        exports.push(buildFunctionExport(node, sourceFile));
      } else if (ts.isInterfaceDeclaration(node) && isNodeExported(node)) {
        exports.push(buildInterfaceExport(node, sourceFile));
      } else if (ts.isEnumDeclaration(node) && isNodeExported(node)) {
        exports.push(buildEnumExport(node, sourceFile));
      } else if (ts.isTypeAliasDeclaration(node) && isNodeExported(node)) {
        exports.push(buildTypeAliasExport(node, sourceFile));
      } else if (ts.isVariableStatement(node) && isNodeExported(node)) {
        exports.push(...buildVariableExports(node, sourceFile));
      }
      ts.forEachChild(node, visit);
    }

    ts.forEachChild(sourceFile, visit);

    const sourceId = determineSourceId(relPath);
    const exportsWithSource =
      exports.length > 0
        ? exports
            .map((entry) => Object.assign({}, entry, { sourceId }))
            .sort((a, b) => `${a.kind}:${a.name}`.localeCompare(`${b.kind}:${b.name}`))
        : [];

    if (exportsWithSource.length) fileMap.set(relPath, exportsWithSource);
  }

  return {
    repo: repoName,
    files: Array.from(fileMap.entries())
      .map(([file, entries]) => ({
        file,
        sourceId: determineSourceId(file),
        exports: entries.sort((a, b) => `${a.kind}:${a.name}`.localeCompare(`${b.kind}:${b.name}`)),
      }))
      .sort((a, b) => a.file.localeCompare(b.file)),
  };
}

function uniqueSorted(items, keyFn) {
  const map = new Map();
  for (const item of items) map.set(keyFn(item), item);
  return Array.from(map.values()).sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
}

function buildSymbolsBySource(symbolIndex) {
  const summary = {};
  for (const fileEntry of symbolIndex.files) {
    const sid = fileEntry.sourceId || 'unknown';
    if (!summary[sid]) {
      summary[sid] = {
        files: [],
        exportsCount: 0,
      };
    }
    summary[sid].files.push(fileEntry.file);
    summary[sid].exportsCount += fileEntry.exports.length;
  }
  const sorted = {};
  for (const sid of Object.keys(summary).sort()) {
    sorted[sid] = {
      files: summary[sid].files.sort(),
      exportsCount: summary[sid].exportsCount,
    };
  }
  return sorted;
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
  lines.push(`- \`docs/knowledge/symbols.json\` (files: ${outputs.symbols.files.length})`);
  lines.push(
    `- \`docs/knowledge/symbols.by-source.json\` (entries: ${Object.keys(outputs.symbolsBySource).length})`
  );
  lines.push(`- \`docs/knowledge/sources.json\` (sources: ${outputs.sources.sources.length})`);
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

  const symbolIndex = collectSymbols(tsFiles);
  const symbolsOut = symbolIndex;
  const sourcesOut = {
    repo: repoName,
    sources: buildSourcesMetadata(),
  };
  const symbolsBySourceOut = buildSymbolsBySource(symbolIndex);

  const outputs = {
    components: componentsOut,
    services: servicesOut,
    modules: modulesOut,
    importsGraph: importsGraphOut,
    symbols: symbolsOut,
    symbolsBySource: symbolsBySourceOut,
    sources: sourcesOut,
  };

  const jsonByPath = new Map([
    [outFiles.components, JSON.stringify(componentsOut, null, 2) + '\n'],
    [outFiles.services, JSON.stringify(servicesOut, null, 2) + '\n'],
    [outFiles.modules, JSON.stringify(modulesOut, null, 2) + '\n'],
    [outFiles.importsGraph, JSON.stringify(importsGraphOut, null, 2) + '\n'],
    [outFiles.symbols, JSON.stringify(symbolsOut, null, 2) + '\n'],
    [outFiles.symbolsBySource, JSON.stringify(symbolsBySourceOut, null, 2) + '\n'],
    [outFiles.sources, JSON.stringify(sourcesOut, null, 2) + '\n'],
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
  console.log(`- ${path.relative(repoRoot, outFiles.symbols)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.symbolsBySource)}`);
  console.log(`- ${path.relative(repoRoot, outFiles.sources)}`);
  console.log(`- ${path.relative(repoRoot, repoMapGeneratedPath)}`);
}

main();
