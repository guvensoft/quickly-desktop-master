#!/usr/bin/env node
/* eslint-disable no-console */

const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

function npxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function defaultChromeProfileDir() {
  if (process.platform === 'darwin') return '/private/tmp';
  return os.tmpdir();
}

function makeChromeProfilePath() {
  const baseDir = defaultChromeProfileDir();
  return path.join(baseDir, `karma-chrome-${process.pid}-${Date.now()}`);
}

function cleanupProfileDir(profileDir) {
  if (!profileDir) return;

  try {
    if (process.platform === 'win32') {
      spawnSync('cmd.exe', ['/c', 'rmdir', '/s', '/q', profileDir], { stdio: 'ignore' });
    } else {
      spawnSync('rm', ['-rf', profileDir], { stdio: 'ignore' });
    }
  } catch (_error) {
    // ignore
  }
}

function ensureChromeBin(env) {
  if (process.platform !== 'darwin') return;
  if (env.CHROME_BIN) return;
  env.CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

function runKarma(args, env) {
  const result = spawnSync(npxCommand(), ['karma', 'start', './karma.conf.js'].concat(args), {
    stdio: 'inherit',
    env,
  });
  return typeof result.status === 'number' ? result.status : 1;
}

function runTscCompileOnly(env) {
  const result = spawnSync(npxCommand(), ['tsc', '-p', './src/tsconfig.spec.json', '--noEmit'], {
    stdio: 'inherit',
    env,
  });
  return typeof result.status === 'number' ? result.status : 1;
}

function parseArgs(argv) {
  const args = [];
  const karmaArgs = [];
  let seenDoubleDash = false;
  for (const arg of argv) {
    if (seenDoubleDash) {
      karmaArgs.push(arg);
      continue;
    }
    if (arg === '--') {
      seenDoubleDash = true;
      continue;
    }
    args.push(arg);
  }
  return { args, karmaArgs };
}

function main() {
  const { args, karmaArgs } = parseArgs(process.argv.slice(2));
  const compileOnly = args.includes('--compile-only');

  const env = Object.assign({}, process.env);
  if (!env.KARMA_CHROME_PROFILE) {
    env.KARMA_CHROME_PROFILE = makeChromeProfilePath();
  }
  ensureChromeBin(env);

  let cleanedUp = false;
  const cleanupOnce = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    cleanupProfileDir(env.KARMA_CHROME_PROFILE);
  };

  process.on('exit', cleanupOnce);
  process.on('SIGINT', () => {
    cleanupOnce();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    cleanupOnce();
    process.exit(143);
  });
  process.on('uncaughtException', (error) => {
    cleanupOnce();
    console.error(error);
    process.exit(1);
  });
  process.on('unhandledRejection', (error) => {
    cleanupOnce();
    console.error(error);
    process.exit(1);
  });

  if (compileOnly) {
    process.exitCode = runTscCompileOnly(env);
    return;
  }

  const exitCode = runKarma(karmaArgs, env);
  cleanupOnce();
  process.exitCode = exitCode;
}

main();

