import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const files = {
  claudePlugin: '.claude-plugin/plugin.json',
  claudeMarketplace: '.claude-plugin/marketplace.json',
  codexPlugin: '.codex-plugin/plugin.json',
  codexMarketplace: '.agents/plugins/marketplace.json',
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function runGit(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
  }
  return result.stdout;
}

const claudePlugin = readJson(files.claudePlugin);
const claudeMarketplace = readJson(files.claudeMarketplace);
const codexPlugin = readJson(files.codexPlugin);
const codexMarketplace = readJson(files.codexMarketplace);
const claudeListing = claudeMarketplace.plugins.find(
  (plugin) => plugin.name === claudePlugin.name,
);
const codexListing = codexMarketplace.plugins.find(
  (plugin) => plugin.name === claudePlugin.name,
);

if (!claudeListing) {
  throw new Error(`No ${claudePlugin.name} entry exists in ${files.claudeMarketplace}`);
}

if (!codexListing) {
  throw new Error(`No ${claudePlugin.name} entry exists in ${files.codexMarketplace}`);
}

if (codexPlugin.name !== claudePlugin.name) {
  throw new Error('The Claude and Codex plugin names do not match');
}

if (!claudePlugin.mcpServers?.['polotno-documentation']) {
  throw new Error('The Claude plugin does not contain the documentation MCP server');
}

if (codexPlugin.mcpServers || existsSync('.mcp.json')) {
  throw new Error('The Codex plugin must not include the optional documentation MCP server');
}

const versions = new Map([
  [files.claudePlugin, claudePlugin.version],
  [files.claudeMarketplace, claudeListing.version],
  [files.codexPlugin, codexPlugin.version],
]);

if ([...new Set(versions.values())].length !== 1) {
  const details = [...versions].map(([path, version]) => `${path}: ${version}`).join('\n');
  throw new Error(`Plugin versions do not match:\n${details}`);
}

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(claudePlugin.version)) {
  throw new Error(`Plugin version ${claudePlugin.version} is not a semantic version`);
}

const base = process.argv[2];
if (base && !/^0+$/.test(base)) {
  const changedSkills = runGit(['diff', '--name-only', base, '--', 'skills/']).trim();
  if (changedSkills) {
    const previousManifest = JSON.parse(
      runGit(['show', `${base}:${files.claudePlugin}`]),
    );
    if (previousManifest.version === claudePlugin.version) {
      throw new Error(
        `Files under skills/ changed, but the plugin version is still ${claudePlugin.version}`,
      );
    }
  }
}

console.log(`Distribution metadata is valid at version ${claudePlugin.version}.`);
