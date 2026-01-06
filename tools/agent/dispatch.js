#!/usr/bin/env node
/* eslint-disable no-console */

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
const pkg = require(path.join(repoRoot, 'package.json'));
const runSlicePath = path.join(repoRoot, 'tools', 'agent', 'run-slice.js');

function die(message) {
  console.error(message);
  process.exit(1);
}

function runCommand(command, args = []) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  const code = typeof result.status === 'number' ? result.status : 1;
  return { command: [command, ...args].join(' ').trim(), code };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let type = null;
  const textParts = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type') {
      type = args[i + 1];
      i += 1;
      continue;
    }

    textParts.push(args[i]);
  }

  const text = textParts.join(' ').trim();
  return { type, text };
}

function guessType(text) {
  const lower = text.toLowerCase();
  const questionKeywords = ['?', 'nerede', 'nasıl', 'ne zaman', 'hangi', 'kim', 'what', 'why', 'how', 'where', 'when'];
  const bugKeywords = ['hata', 'bug', 'fix', 'düzelt', 'çalışmıyor', 'fail', 'error'];
  const upgradeKeywords = ['upgrade', 'güncelle', 'versiyon', 'sürüm', 'yükselt', 'update'];
  const featureKeywords = ['feature', 'özellik', 'add', 'yeni', 'support', 'destek', 'enhancement'];

  if (questionKeywords.some((kw) => lower.includes(kw))) return 'question';
  if (bugKeywords.some((kw) => lower.includes(kw))) return 'bugfix';
  if (upgradeKeywords.some((kw) => lower.includes(kw))) return 'upgrade';
  if (featureKeywords.some((kw) => lower.includes(kw))) return 'feature';
  return 'feature';
}

function main() {
  const { type: explicitType, text } = parseArgs(process.argv);
  if (!text) {
    die('Kullanım: node tools/agent/dispatch.js "<task text>" [--type question|feature|bugfix|upgrade]');
  }

  const type = explicitType || guessType(text);
  if (!['question', 'feature', 'bugfix', 'upgrade'].includes(type)) {
    die('Geçersiz type. question|feature|bugfix|upgrade içinden seçin.');
  }

  console.log(`Dispatch: type=${type}`);
  runCommand(process.execPath, [runSlicePath, type, text]);

  const queue = [];
  const enqueue = (script) => {
    if (pkg.scripts && typeof pkg.scripts[script] === 'string') {
      queue.push({ script, command: 'npm', args: ['run', script] });
    } else {
      console.log(`Skipping ${script}: npm script tanımlı değil.`);
    }
  };

  ['index', 'docs:verify', 'test:compile', 'build'].forEach(enqueue);

  const executed = [];
  for (const item of queue) {
    const result = runCommand(item.command, item.args);
    executed.push(result);
    if (result.code !== 0) {
      console.log(`Command failed: ${result.command}`);
      process.exit(result.code);
    }
  }

  console.log('Dispatch summary:');
  executed.forEach((result) => console.log(`- ${result.command} (code=${result.code})`));
}

main();
