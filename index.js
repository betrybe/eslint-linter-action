const path = require('path');
const fs = require('fs');
const { spawnSync } = require("child_process");
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
  const process = spawnSync(
    'npm',
    ['ci'],
    { cwd: path.dirname(file) }
  );
  if (process.error) {
    console.log(`error: ${process.error.message}`);
  }
  if (process.stderr) {
    console.log(`stderr: ${process.stderr}`);
  }
  console.log(`stdout: ${process.stdout}`);
  console.log(`status: ${process.status}`);
  return process.status;
}

const callback_eslint = (file) => {
  console.log('-- found: ', file);
  const process = spawnSync(
    `npx`,
    ['eslint', '--no-inline-config', '-c', path.basename(file), '.'],
    { cwd: path.dirname(file) }
  );
  if (process.error) {
    console.log(`error: ${process.error.message}`);
  }
  if (process.stderr) {
    console.log(`stderr: ${process.stderr}`);
  }
  console.log(`stdout: ${process.stdout}`);
  console.log(`status: ${process.status}`);
  return process.status;
}

const run = () => {
  let status = 0
  status += fromDir(root, 'package.json', callback_npm);
  status += fromDir(root, '.eslintrc.json', callback_eslint);
  console.log(`exit code: ${status}`);
  process.exit(status);
}

run();
