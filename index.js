const path = require('path');
const { spawnSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');
const buildFeedbackMessage = require('./feedbackMessage');
const fromDir = require('./fromDir');

const root = process.env.GITHUB_WORKSPACE || process.cwd();
let eslintOutcomes = [];

const logProcessConclusion = ({ error, status, stderr = '', stdout = '' }) => {
  const parsedStderr = stderr.toString();
  const parsedStdout = stdout.toString();

  if (error) console.log('error:', error.message);
  if (parsedStderr) console.log('stderr:', parsedStderr);

  console.log('stdout:', parsedStdout);
  console.log('status:', status);
};

const runNpm = (file) => {
  console.log('-- found:', file);

  const npmProcess = spawnSync(
    'npm',
    ['ci'],
    { cwd: path.dirname(file) },
  );

  logProcessConclusion(npmProcess);

  return npmProcess.status;
};

const runEslint = (file) => {
  console.log('-- found:', file);

  const eslintProcess = spawnSync(
    'npx',
    ['eslint', '-f', 'json', '--no-inline-config', '--no-error-on-unmatched-pattern', '-c', path.basename(file), '.'],
    { cwd: path.dirname(file) },
  );

  logProcessConclusion(eslintProcess);

  eslintOutcomes = eslintOutcomes.concat(JSON.parse(eslintProcess.stdout));

  return eslintProcess.status;
};

const run = async () => {
  try {
    const token = core.getInput('token', { required: true });
    const client = github.getOctokit(token);
    const { owner, repo, number } = github.context.issue;
    let status = 0;

    status += fromDir(root, 'package.json', runNpm);
    status += fromDir(root, '.eslintrc.json', runEslint);

    console.log('Exit code:', status);
    console.log('All errors:', eslintOutcomes);

    const feedbackMessage = buildFeedbackMessage(eslintOutcomes, root);

    console.log('Feedback message:\n', feedbackMessage);

    await client.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: feedbackMessage,
    });

    process.exit(status);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
