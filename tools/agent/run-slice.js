#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const slicePath = path.join(repoRoot, 'tasks', 'ACTIVE_SLICE.md');

function die(message) {
  console.error(message);
  process.exit(1);
}

function runShell(command) {
  const result = spawnSync(command, {
    cwd: repoRoot,
    shell: true,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const code = typeof result.status === 'number' ? result.status : 1;

  return { command, code, stdout, stderr };
}

function readSlice() {
  try {
    return fs.readFileSync(slicePath, 'utf8');
  } catch {
    die('ERROR: tasks/ACTIVE_SLICE.md bulunamadı. Önce slice oluşturun.');
  }
}

function findEvidenceInsertionRange(markdown) {
  const lines = markdown.split('\n');
  const lower = lines.map((l) => l.toLowerCase());

  let evidenceStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lower[i].trim();
    if (line === 'evidence:' || line.startsWith('## evidence') || line.startsWith('# evidence')) {
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

  return { lines, evidenceStart, insertAt };
}

function appendToEvidence(markdown, textToInsert) {
  const range = findEvidenceInsertionRange(markdown);
  if (!range) die('ERROR: ACTIVE_SLICE.md içinde Evidence bölümü yok. Evidence: başlığı ekleyin.');

  const { lines, insertAt } = range;
  const insertLines = textToInsert.trimEnd().split('\n');
  const newLines = [...lines.slice(0, insertAt), ...insertLines, ...lines.slice(insertAt)];
  return newLines.join('\n');
}

function getChangedFiles() {
  const unstaged = runShell('git diff --name-only');
  const staged = runShell('git diff --cached --name-only');

  const names = new Set();
  for (const out of [unstaged.stdout, staged.stdout]) {
    for (const line of out.split('\n')) {
      const trimmed = line.trim();
      if (trimmed) names.add(trimmed);
    }
  }
  return Array.from(names).sort();
}

function parseFileBudget(markdown) {
  const m = /file budget\s*:\s*([0-9]+)/i.exec(markdown);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function buildEvidenceBlock(runResults) {
  const now = new Date();
  const stamp = now.toISOString();

  const lines = [];
  lines.push('');
  lines.push(`### Run Evidence (${stamp})`);
  for (const r of runResults) {
    lines.push('');
    lines.push('```');
    lines.push(`$ ${r.command}`);
    lines.push(`exitCode: ${r.code}`);
    if (r.stdout.trim()) lines.push(r.stdout.trimEnd());
    if (r.stderr.trim()) lines.push(r.stderr.trimEnd());
    lines.push('```');
  }
  lines.push('');
  return lines.join('\n');
}

function hasNpmScript(scriptName) {
  const r = runShell(
    `node -e "const p=require('./package.json');process.exit(p.scripts && p.scripts['${scriptName}']?0:1)"`
  );
  return r.code === 0;
}

function main() {
  const slice = readSlice();

  const fileBudget = parseFileBudget(slice);
  if (fileBudget !== null) {
    const changedFiles = getChangedFiles();
    if (changedFiles.length > fileBudget) {
      die(
        `ERROR: File budget aşıldı. Budget=${fileBudget}, changedFiles=${changedFiles.length}\n` +
          changedFiles.map((f) => `- ${f}`).join('\n')
      );
    }
  }

  const commands = [];
  commands.push('npm run index || node tools/indexer/index.js');
  if (hasNpmScript('verify')) {
    commands.push('npm run verify');
  } else {
    for (const s of ['lint', 'test', 'typecheck', 'build']) {
      if (hasNpmScript(s)) commands.push(`npm run ${s}`);
    }
    commands.push('npm run index || node tools/indexer/index.js');
  }

  const results = [];
  let failed = false;
  for (const cmd of commands) {
    const r = runShell(cmd);
    results.push(r);
    if (r.code !== 0) failed = true;
  }

  const updated = appendToEvidence(slice, buildEvidenceBlock(results));
  fs.writeFileSync(slicePath, updated, 'utf8');

  if (failed) process.exit(1);
}

main();
