module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(104);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 104:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const path = __webpack_require__(622);
const fs = __webpack_require__(747);
const { spawnSync } = __webpack_require__(129);
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

const run = () => {
  let status = 0
  status += fromDir(root, 'package.json', callback_npm);
  status += fromDir(root, '.eslintrc.json', callback_eslint);
  console.log(`exit code: ${status}`);
  process.exit(status);
}

run();


/***/ }),

/***/ 129:
/***/ (function(module) {

module.exports = require("child_process");

/***/ }),

/***/ 622:
/***/ (function(module) {

module.exports = require("path");

/***/ }),

/***/ 747:
/***/ (function(module) {

module.exports = require("fs");

/***/ })

/******/ });