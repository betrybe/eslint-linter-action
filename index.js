const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const core = require('@actions/core');
const github = require('@actions/github');
const buildFeedbackMessage = require('./feedbackMessage');

const root = process.env.GITHUB_WORKSPACE || process.cwd();
let eslintOutcomes = [];

console.log('root: ', root)

function fromDir(startPath, filter, callback) {
  let executionStatus = 0;
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }
  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    if (filename.indexOf("node_modules") === -1) {
      const stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        executionStatus += fromDir(filename, filter, callback);
      }
      else if (filename.indexOf(filter) >= 0) {
        executionStatus += callback(filename);
      };
    };
  };

  return executionStatus;
};

const runNpm = (file) => {
  console.log('-- found: ', file);
  const npmProcess = spawnSync(
    'npm',
    ['ci'],
    { cwd: path.dirname(file) }
  );
  if (npmProcess.error) {
    console.log(`error: ${npmProcess.error.message}`);
  }
  if (npmProcess.stderr) {
    console.log(`stderr: ${npmProcess.stderr}`);
  }
  console.log(`stdout: ${npmProcess.stdout}`);
  console.log(`status: ${npmProcess.status}`);
  return npmProcess.status;
}

const runEslint = (file) => {
  console.log('-- found: ', file);
  const eslintProcess = spawnSync(
    `npx`,
    ['eslint', '-f', 'json' ,'--no-inline-config', '-c', path.basename(file), '.'],
    { cwd: path.dirname(file) }
  );
  if (eslintProcess.error) {
    console.log(`error: ${eslintProcess.error.message}`);
  }
  if (eslintProcess.stderr) {
    console.log(`stderr: ${eslintProcess.stderr}`);
  }
  eslintOutcomes = eslintOutcomes.concat(JSON.parse(eslintProcess.stdout));
  console.log(`stdout: ${eslintProcess.stdout}`);
  console.log(`status: ${eslintProcess.status}`);
  return eslintProcess.status;
}

const createPullRequestComment = async (client, comment) => {
  const { owner, repo, number } = github.context.issue;

  console.log('owner', owner);
  console.log('repo', repo);
  console.log('number', number);

  await client.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: comment
  });
}

const run = async () => {
  try {
    const token = core.getInput('token', { required: true });
    const client = github.getOctokit(token);
    let status = 0;

    status += fromDir(root, 'package.json', runNpm);
    status += fromDir(root, '.eslintrc.json', runEslint);

    console.log(`exit code: ${status}`);
    console.log("All errors", eslintOutcomes);

    const feedbackMessage = buildFeedbackMessage(eslintOutcomes, root);

    console.log('feedbackMessage\n', feedbackMessage);

    await createPullRequestComment(client, feedbackMessage);

    process.exit(status);
  }
  catch(error) {
    core.setFailed(error.message);
  }
}

run();
