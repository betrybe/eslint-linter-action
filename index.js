const path = require('path');
const fs = require('fs');
const { spawnSync } = require("child_process");
const core = require('@actions/core');
const github = require('@actions/github');

const root = process.env.GITHUB_WORKSPACE || process.cwd()

console.log('root: ', root)

function fromDir(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }
  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    if (filename.indexOf("node_modules") === -1) {
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        fromDir(filename, filter, callback);
      }
      else if (filename.indexOf(filter) >= 0) {
        return callback(filename);
      };
    };
  };
};

const callback_npm = (file) => {
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

const callback_eslint = (file) => {
  console.log('-- found: ', file);
  const eslintProcess = spawnSync(
    `npx`,
    ['eslint', '--no-inline-config', '-c', path.basename(file), '.'],
    { cwd: path.dirname(file) }
  );
  if (eslintProcess.error) {
    console.log(`error: ${eslintProcess.error.message}`);
  }
  if (eslintProcess.stderr) {
    console.log(`stderr: ${eslintProcess.stderr}`);
  }
  console.log(`stdout: ${eslintProcess.stdout}`);
  console.log(`status: ${eslintProcess.status}`);
  return eslintProcess.status;
}

const createPullRequestComment = async () => {
  const token = core.getInput('token', { required: true });
  const octokit = github.getOctokit(token);
  const { owner, repo, number } = github.context.issue;

  console.log('owner', owner);
  console.log('repo', repo);
  console.log('number', number);

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: number,
    body: "Testa comentário"
  });
}

const run = async () => {
  try {
    let status = 0;

    status += fromDir(root, 'package.json', callback_npm);
    status += fromDir(root, '.eslintrc.json', callback_eslint);
    console.log(`exit code: ${status}`);

    await createPullRequestComment();

    process.exit(status);
  }
  catch(error) {
    core.setFailed(error.message);
  }
}

run();
