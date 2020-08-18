const fs = require('fs');

const fromDir = (startPath, filter, callback) => {
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


module.exports = fromDir;
