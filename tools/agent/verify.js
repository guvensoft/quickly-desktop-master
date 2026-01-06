#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const packageJsonPath = path.join(repoRoot, 'package.json');
const nodeModulesPath = path.join(repoRoot, 'node_modules');
const nodeModulesBinPath = path.join(nodeModulesPath, '.bin');

function readPackageJson() {
  try {
    const raw = fs.readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`VERIFY_STEP package_json FAIL message=${JSON.stringify(String(error && error.message))}`);
    process.exit(1);
  }
}

function hasNpmScript(scripts, scriptName) {
  return typeof scripts[scriptName] === 'string' && scripts[scriptName].trim().length > 0;
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function installSuggestion() {
  const hasPackageLock = fs.existsSync(path.join(repoRoot, 'package-lock.json'));
  if (hasPackageLock) return 'npm ci';
  return 'npm install';
}

function isDirectory(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (_error) {
    return false;
  }
}

function localBinExists(binName) {
  const candidates =
    process.platform === 'win32'
      ? [binName, `${binName}.cmd`, `${binName}.ps1`]
      : [binName];
  return candidates.some((candidate) => fs.existsSync(path.join(nodeModulesBinPath, candidate)));
}

function runReadiness(scripts) {
  const needsTest = hasNpmScript(scripts, 'test');
  const needsBuild = hasNpmScript(scripts, 'build');

  if (!needsTest && !needsBuild) {
    return { exitCode: 0, skipped: true, reason: 'no_required_steps' };
  }

  if (!isDirectory(nodeModulesPath)) {
    const suggestion = installSuggestion();
    return { exitCode: 1, reason: 'node_modules_missing', suggest: suggestion };
  }

  if (!isDirectory(nodeModulesBinPath)) {
    const suggestion = installSuggestion();
    return { exitCode: 1, reason: 'node_modules_bin_missing', suggest: suggestion };
  }

  const missing = [];
  if (needsTest && !localBinExists('karma')) missing.push('karma');
  if (needsBuild && !localBinExists('webpack')) missing.push('webpack');

  if (missing.length > 0) {
    const suggestion = installSuggestion();
    return { exitCode: 1, reason: 'missing_bins', missing, suggest: suggestion };
  }

  return { exitCode: 0 };
}

function runNpmScript(scriptName) {
  const result = spawnSync(npmCommand(), ['run', scriptName], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
  const exitCode = typeof result.status === 'number' ? result.status : 1;
  return { exitCode };
}

function runIndex(scripts) {
  if (hasNpmScript(scripts, 'index')) return runNpmScript('index');

  const result = spawnSync(process.execPath, [path.join(repoRoot, 'tools', 'indexer', 'index.js')], {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
  const exitCode = typeof result.status === 'number' ? result.status : 1;
  return { exitCode };
}

function main() {
  const pkg = readPackageJson();
  const scripts = pkg.scripts || {};

  let hadWarn = false;
  let hadFail = false;

  console.log('VERIFY_STEP readiness START');
  const readinessResult = runReadiness(scripts);
  if (readinessResult.exitCode === 0) {
    if (readinessResult.skipped) {
      console.log(`VERIFY_STEP readiness PASS skipped=1 reason=${readinessResult.reason}`);
    } else {
      console.log('VERIFY_STEP readiness PASS');
    }
  } else {
    const reason = readinessResult.reason || 'unknown';
    const missing = readinessResult.missing ? ` missing=${JSON.stringify(readinessResult.missing)}` : '';
    const suggest = readinessResult.suggest ? ` suggest=${JSON.stringify(readinessResult.suggest)}` : '';
    console.log(`VERIFY_STEP readiness FAIL reason=${reason}${missing}${suggest}`);
    console.log('VERIFY_SUMMARY FAIL');
    process.exit(1);
  }

  const steps = [
    { name: 'lint', kind: 'best_effort' },
    { name: 'test', kind: 'required' },
    { name: 'build', kind: 'required' },
  ];

  for (const step of steps) {
    if (!hasNpmScript(scripts, step.name)) {
      console.log(`VERIFY_STEP ${step.name} PASS skipped=1 reason=no_script`);
      continue;
    }

    console.log(`VERIFY_STEP ${step.name} START`);
    const { exitCode } = runNpmScript(step.name);

    if (exitCode === 0) {
      console.log(`VERIFY_STEP ${step.name} PASS exitCode=0`);
      continue;
    }

    if (step.kind === 'best_effort') {
      hadWarn = true;
      console.log(`VERIFY_STEP ${step.name} WARN exitCode=${exitCode}`);
    } else {
      hadFail = true;
      console.log(`VERIFY_STEP ${step.name} FAIL exitCode=${exitCode}`);
    }
  }

  console.log('VERIFY_STEP index START');
  const indexResult = runIndex(scripts);
  if (indexResult.exitCode === 0) {
    console.log('VERIFY_STEP index PASS exitCode=0');
  } else {
    hadFail = true;
    console.log(`VERIFY_STEP index FAIL exitCode=${indexResult.exitCode}`);
  }

  const overall = hadFail ? 'FAIL' : hadWarn ? 'WARN' : 'PASS';
  console.log(`VERIFY_SUMMARY ${overall}`);
  process.exit(hadFail ? 1 : 0);
}

main();
