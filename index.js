const path = require('path');
const fs = require('fs');
const { spawnSync } = require("child_process");
const core = require('@actions/core');

const root = process.env.GITHUB_WORKSPACE || process.cwd()

core.info('root: ', root)

function fromDir(startPath, filter, callback) {
  if (!fs.existsSync(startPath)) {
    core.info("no dir ", startPath);
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
  core.info('-- found: ', file);
  const npmProcess = spawnSync(
    'npm',
    ['ci'],
    { cwd: path.dirname(file) }
  );
  if (npmProcess.error) {
    core.info(`error: ${npmProcess.error.message}`);
  }
  if (npmProcess.stderr) {
    core.info(`stderr: ${npmProcess.stderr}`);
  }
  core.info(`stdout: ${npmProcess.stdout}`);
  core.info(`status: ${npmProcess.status}`);
  return npmProcess.status;
}

const callback_eslint = (file) => {
  core.info('-- found: ', file);
  const eslintProcess = spawnSync(
    `npx`,
    ['eslint', '--no-inline-config', '-c', path.basename(file), '.'],
    { cwd: path.dirname(file) }
  );
  if (eslintProcess.error) {
    core.info(`error: ${eslintProcess.error.message}`);
  }
  if (eslintProcess.stderr) {
    core.info(`stderr: ${eslintProcess.stderr}`);
  }
  core.info(`stdout: ${eslintProcess.stdout}`);
  core.info(`status: ${eslintProcess.status}`);
  return eslintProcess.status;
}

const run = () => {
  let status = 0
  status += fromDir(root, 'package.json', callback_npm);
  status += fromDir(root, '.eslintrc.json', callback_eslint);
  core.info(`exit code: ${status}`);
  process.exit(status);
}

run();
