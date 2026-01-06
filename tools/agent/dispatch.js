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
const runSlicePath = path.join(repoRoot, 'tools', 'agent', 'run-slice.js');
const pkg = require(path.join(repoRoot, 'package.json'));

function die(message) {
  console.error(message);
  process.exit(1);
}

function runCommand(command, args = [], opts = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: opts.stdio || 'inherit',
  });
  const code = typeof result.status === 'number' ? result.status : 1;
  return { command: [command, ...args].join(' ').trim(), code };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let type = null;
  let verifyFlag = false;
  const textParts = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type') {
      type = args[i + 1];
      i += 1;
      continue;
    }
    if (args[i] === '--verify') {
      verifyFlag = true;
      continue;
    }
    textParts.push(args[i]);
  }

  const text = textParts.join(' ').trim();
  return { type, text, verifyFlag };
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
  const { type: explicitType, text, verifyFlag } = parseArgs(process.argv);
  if (!text) {
    die('Kullanım: node tools/agent/dispatch.js "<task text>" [--type question|feature|bugfix|upgrade] [--verify]');
  }

  const type = explicitType || guessType(text);
  if (!['question', 'feature', 'bugfix', 'upgrade'].includes(type)) {
    die('Geçersiz type. question|feature|bugfix|upgrade içinden seçin.');
  }

  console.log(`Dispatching task type=${type}`);

  const runSlice = runCommand(process.execPath, [runSlicePath, type, text]);
  if (runSlice.code !== 0) {
    die(`run-slice failed (${runSlice.code}); see output above.`);
  }

  const wantsVerify = verifyFlag || process.env.REQUIRE_VERIFY === '1';

  console.log('Default flow: slice created + index executed.');
  if (pkg.scripts && typeof pkg.scripts.index === 'string') {
    const indexResult = runCommand('npm', ['run', 'index']);
    if (indexResult.code !== 0) {
      die(`npm run index failed (code=${indexResult.code})`);
    }
  } else {
    console.log('INFO: npm run index scripti tanımlı değil; atlandı.');
  }

  if (wantsVerify) {
    const commands = ['docs:verify', 'test:compile', 'build'];
    for (const script of commands) {
      if (pkg.scripts && typeof pkg.scripts[script] === 'string') {
        const result = runCommand('npm', ['run', script]);
        if (result.code !== 0) {
          die(`npm run ${script} failed (code=${result.code})`);
        }
      } else {
        console.log(`INFO: npm run ${script} scripti tanımlı değil; atlandı.`);
      }
    }
    console.log('Optional verification pipeline completed.');
  } else {
    console.log('Heavy verification disabled by default (use --verify or REQUIRE_VERIFY=1).');
  }
}

main();
