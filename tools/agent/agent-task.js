#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function resolveRepoRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status === 0) {
    const out = String(result.stdout || '').trim();
    if (out) return out;
  }

  return process.cwd();
}

const repoRoot = resolveRepoRoot();
const slicePath = path.join(repoRoot, 'tasks', 'ACTIVE_SLICE.md');
const indexScriptPath = path.join(repoRoot, 'tools', 'indexer', 'index.js');

function die(message) {
  console.error(message);
  process.exit(1);
}

function runCommand(command, args = [], options = {}) {
  const opts = {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    stdio: options.stdio || 'pipe',
  };

  const result = spawnSync(command, args, opts);
  const code = typeof result.status === 'number' ? result.status : 1;
  return {
    command: [command, ...args].join(' ').trim(),
    code,
    stdout: result.stdout ? String(result.stdout) : '',
    stderr: result.stderr ? String(result.stderr) : '',
  };
}

function hasNpmScript(scriptName) {
  const result = runCommand(process.execPath, ['-e', `const p=require('./package.json');process.exit(p.scripts && p.scripts['${scriptName}']?0:1)`]);
  return result.code === 0;
}

function readSlice() {
  try {
    return fs.readFileSync(slicePath, 'utf8');
  } catch (error) {
    die(`ERROR: ${slicePath} okunamadı (${error.message}). Önce slice oluşturun.`);
  }
}

function findEvidenceInsertionRange(markdown) {
  const lines = markdown.split('\n');
  const lower = lines.map((l) => l.toLowerCase());

  let evidenceStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lower[i].trim();
    if (trimmed === 'evidence:' || trimmed.startsWith('## evidence') || trimmed.startsWith('# evidence')) {
      evidenceStart = i;
      break;
    }
  }
  if (evidenceStart === -1) return null;

  let insertAt = lines.length;
  for (let i = evidenceStart + 1; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) {
      insertAt = i;
      break;
    }
  }

  return { lines, insertAt };
}

function appendToEvidence(markdown, insertLines) {
  const range = findEvidenceInsertionRange(markdown);
  if (!range) {
    die('ERROR: Evidence bölümü bulunamadı. ACTIVE_SLICE.md içinde `Evidence:` başlığı ekleyin.');
  }

  const { lines, insertAt } = range;
  const newLines = [...lines.slice(0, insertAt), ...insertLines, ...lines.slice(insertAt)];
  return newLines.join('\n');
}

function ensureSliceExists() {
  if (!fs.existsSync(slicePath)) {
    die(`ERROR: Slice dosyası bulunamadı (${slicePath}). Önce slice oluşturun.`);
  }
}

function toKeywords(value) {
  if (!value) return [];
  const parts = value
    .split(/[^a-zA-Z0-9]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return Array.from(new Set(parts.map((p) => p.toLowerCase())));
}

function runRipgrep(term) {
  try {
    const result = spawnSync('rg', ['-n', '--no-heading', '--color', 'never', '-F', term], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (result.status && result.status > 1) {
      return [];
    }

    return (result.stdout || '').split('\n').filter(Boolean);
  } catch (error) {
    console.warn(`WARN: rg çalıştırılamadı (${error.message}).`);
    return [];
  }
}

function gatherMatches(type, title, limit = 10) {
  if (!['feature', 'bugfix'].includes(type)) return [];

  const general = ['usb', 'ipc', 'printer', 'pouchdb', 'auth', 'routes'];
  const titleKeys = toKeywords(title);
  const keywords = [...titleKeys, ...general].filter(Boolean);
  const seen = new Set();
  const matches = [];

  for (const keyword of keywords) {
    if (matches.length >= limit) break;
    const lines = runRipgrep(keyword);
    for (const line of lines) {
      if (matches.length >= limit) break;
      const m = /^([^:]+):(\d+):(.*)$/.exec(line);
      if (!m) continue;
      const file = m[1];
      const key = `${file}:${m[2]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        file,
        line: Number(m[2]),
        snippet: m[3].trim(),
        keyword,
      });
    }
  }

  return matches;
}

function buildEvidenceLines(matches, verificationResults, notes) {
  const lines = [];

  if (matches.length) {
    lines.push('', '### Auto search evidence');
    for (const match of matches) {
      const snippet = match.snippet.length > 120 ? `${match.snippet.slice(0, 117)}...` : match.snippet;
      lines.push(`- \`${match.file}:${match.line}\` — ${snippet} (keyword: ${match.keyword})`);
    }
  }

  if (verificationResults.length) {
    lines.push('', '### Verification results');
    for (const result of verificationResults) {
      const status = result.code === 0 ? 'OK' : 'FAIL';
      lines.push(`- ${result.command} — ${status} (code=${result.code})`);
    }
  }

  if (notes.length) {
    lines.push('', '### Notes');
    notes.forEach((note) => lines.push(`- ${note}`));
  }

  return lines;
}

function ensureTasksDir() {
  const tasksDir = path.dirname(slicePath);
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }
}

function main() {
  const [type, titleRaw] = process.argv.slice(2);
  const title = titleRaw || '(untitled)';

  if (!type || !['question', 'feature', 'bugfix', 'upgrade'].includes(type)) {
    die('Kullanım: node tools/agent/agent-task.js <question|feature|bugfix|upgrade> "<title>"');
  }

  ensureTasksDir();
  const runSlice = runCommand(process.execPath, [path.join(repoRoot, 'tools', 'agent', 'run-slice.js'), type, title], {
    stdio: 'inherit',
  });

  if (runSlice.code !== 0) {
    die(`run-slice komutu başarısız oldu (code=${runSlice.code})`);
  }

  ensureSliceExists();

  const matches = gatherMatches(type, title);
  const verificationResults = [];
  const notes = [];

  const indexCommand = hasNpmScript('index')
    ? { command: 'npm', args: ['run', 'index'] }
    : fs.existsSync(indexScriptPath)
    ? { command: process.execPath, args: [indexScriptPath] }
    : null;

  if (indexCommand) {
    verificationResults.push(runCommand(indexCommand.command, indexCommand.args));
  } else {
    notes.push('index script/arbitrairy indexer bulunamadı; bu adım atlandı.');
  }

  if (hasNpmScript('docs:verify')) {
    verificationResults.push(runCommand('npm', ['run', 'docs:verify']));
  } else {
    notes.push('npm run docs:verify scripti tanımlı değil; atlandı.');
  }

  if (hasNpmScript('test:compile')) {
    verificationResults.push(runCommand('npm', ['run', 'test:compile']));
  } else {
    notes.push('npm run test:compile scripti tanımlı değil; atlandı.');
  }

  const slice = readSlice();
  const evidenceLines = buildEvidenceLines(matches, verificationResults, notes);
  if (evidenceLines.length) {
    const updated = appendToEvidence(slice, evidenceLines);
    fs.writeFileSync(slicePath, updated, 'utf8');
  } else {
    console.log('WARN: Eklenebilecek evidence satırı bulunamadı.');
  }
}

main();
