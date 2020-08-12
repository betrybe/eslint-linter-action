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
  const process = spawnSync(
    'npm',
    ['ci'],
    { cwd: path.dirname(file) }
  );
  if (process.error) {
    core.info(`error: ${process.error.message}`);
  }
  if (process.stderr) {
    core.info(`stderr: ${process.stderr}`);
  }
  core.info(`stdout: ${process.stdout}`);
  core.info(`status: ${process.status}`);
  return process.status;
}

const callback_eslint = (file) => {
  core.info('-- found: ', file);
  const process = spawnSync(
    `npx`,
    ['eslint', '--no-inline-config', '-c', path.basename(file), '.'],
    { cwd: path.dirname(file) }
  );
  if (process.error) {
    core.info(`error: ${process.error.message}`);
  }
  if (process.stderr) {
    core.info(`stderr: ${process.stderr}`);
  }
  core.info(`stdout: ${process.stdout}`);
  core.info(`status: ${process.status}`);
  return process.status;
}

const run = () => {
  let status = 0
  status += fromDir(root, 'package.json', callback_npm);
  status += fromDir(root, '.eslintrc.json', callback_eslint);
  core.info(`exit code: ${status}`);
  process.exit(status);
}

run();
