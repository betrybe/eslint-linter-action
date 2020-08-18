const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');
const buildFeedbackMessage = require('./feedbackMessage');

const root = process.env.GITHUB_WORKSPACE || process.cwd();
let eslintOutcomes = [];

function fromDir(startPath, filter, callback) {
  let executionStatus = 0;

  if (!fs.existsSync(startPath)) {
    console.log('Path does not exist:', startPath);
    return 1;
  }

  const files = fs.readdirSync(startPath);

  for (let i = 0; i < files.length; i += 1) {
    const filename = path.join(startPath, files[i]);

    if (filename.indexOf('node_modules') !== -1) continue;

    const stat = fs.lstatSync(filename);

    if (stat.isDirectory()) executionStatus += fromDir(filename, filter, callback);
    else if (filename.indexOf(filter) >= 0) executionStatus += callback(filename);
  }

  return executionStatus;
}

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
