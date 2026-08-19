const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const packageFile = path.join(__dirname, 'package.json');
const nodeModulesDirectory = path.join(__dirname, 'node_modules');
const stateFile = path.join(nodeModulesDirectory, '.polotno-dependencies.json');
const dependencies = JSON.parse(fs.readFileSync(packageFile, 'utf8')).dependencies;
const policy = JSON.stringify(dependencies);

function installedVersions() {
  const versions = {};
  try {
    for (const name of Object.keys(dependencies)) {
      const dependencyFile = path.join(nodeModulesDirectory, ...name.split('/'), 'package.json');
      versions[name] = JSON.parse(fs.readFileSync(dependencyFile, 'utf8')).version;
    }
    return versions;
  } catch {
    return null;
  }
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return null;
  }
}

function needsUpdate(state, policy, versions, now, intervalMs = CHECK_INTERVAL_MS) {
  if (!versions || !state || state.policy !== policy) return true;
  const checkedAt = Date.parse(state.checkedAt);
  const age = now - checkedAt;
  return !Number.isFinite(age) || age < 0 || age >= intervalMs;
}

function ensureDependencies(options = {}) {
  const now = options.now ?? Date.now();
  const intervalMs = options.intervalMs ?? CHECK_INTERVAL_MS;
  const currentVersions = installedVersions();

  if (process.env.POLOTNO_DEPENDENCY_UPDATE === 'never') {
    if (!currentVersions) {
      throw new Error('The npm dependencies are missing, and automatic updates are disabled.');
    }
    return JSON.stringify(currentVersions);
  }

  if (!needsUpdate(readState(), policy, currentVersions, now, intervalMs)) {
    return JSON.stringify(currentVersions);
  }

  const action = currentVersions ? 'update' : 'install';
  console.error(`npm dependency ${action} started`);
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(
    npmCommand,
    [
      action,
      '--no-save',
      '--package-lock=false',
      '--prefer-online'
    ],
    { cwd: __dirname, stdio: 'inherit' }
  );
  const nextVersions = installedVersions();

  if (!nextVersions) {
    throw new Error('The npm dependency installation did not produce all required packages.');
  }
  if (result.status !== 0) {
    console.error('The npm dependency update failed. The scripts will use the installed versions.');
  }

  const state = {
    checkedAt: new Date(now).toISOString(),
    status: result.status === 0 ? 'ok' : 'failed',
    policy,
    versions: nextVersions
  };
  fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);

  return JSON.stringify(nextVersions);
}

module.exports = { CHECK_INTERVAL_MS, ensureDependencies, needsUpdate };
