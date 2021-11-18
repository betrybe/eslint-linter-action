const core = require('@actions/core');
const { spawnSync } = require('child_process');
const path = require('path');
const logProcessConclusion = require('./logProcessConclusion');

const runEslintWithConfigFile = (file) => {
  console.log('-- found:', file);

  const ignoreInlineConfig = core.getInput('ignoreInlineConfig') == 'true';

  const args = [
    'eslint',
    '-f', 'json',
    '--ext', '.ts, .tsx, .js, .jsx',
    '--no-error-on-unmatched-pattern',
    '-c', path.basename(file),
    '.',
  ];

  if (ignoreInlineConfig) args.splice(3, 0, '--no-inline-config');

  const eslintProcess = spawnSync(
    'npx',
    args,
    { cwd: path.dirname(file) },
  );
  const outcomes = JSON.parse(eslintProcess.stdout);

  logProcessConclusion(eslintProcess);

  return { status: eslintProcess.status, outcomes };
};

module.exports = runEslintWithConfigFile;
