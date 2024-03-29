jest.mock('@actions/core');
jest.mock('child_process');

const { getInput } = require('@actions/core');
const { spawnSync } = require('child_process');
const eslintResultWithError = require('./fixtures/eslint-results/oneError.json');
const eslintResultWithoutError = require('./fixtures/eslint-results/frontEndNoError.json');
const runEslintWithConfigFile = require('../runEslintWithConfigFile');

describe('Running eslint', () => {
  test('When there is an eslint config file to analyse and the analysis shows no issue, a success status is returned', () => {
    spawnSync.mockReturnValue({ status: 0, stdout: JSON.stringify(eslintResultWithoutError) });
    getInput.mockReturnValue('true');

    const packageDirectory = '/path/to/project';
    const packageFile = `${packageDirectory}/.eslintrc.json`;
    const receivedStatus = runEslintWithConfigFile(packageFile);

    expect(receivedStatus).toStrictEqual({ status: 0, outcomes: eslintResultWithoutError });
    expect(spawnSync).toHaveBeenCalledWith(
      'npx',
      [
        'eslint',
        '-f', 'json',
        '--no-inline-config',
        '--ext', '.ts, .tsx, .js, .jsx',
        '--no-error-on-unmatched-pattern',
        '-c', '.eslintrc.json',
        '.'
      ],
      { cwd: packageDirectory },
    );
  });

  test('When there is an eslint config file to analyse but there is no js file to be analysed, a success status is returned', () => {
    const emptyEslintResult = [];

    spawnSync.mockReturnValue({ status: 0, stdout: JSON.stringify(emptyEslintResult) });
    getInput.mockReturnValue('true');

    const packageDirectory = '/path/to/project';
    const packageFile = `${packageDirectory}/.eslintrc.json`;
    const receivedStatus = runEslintWithConfigFile(packageFile);

    expect(receivedStatus).toStrictEqual({ status: 0, outcomes: emptyEslintResult });
    expect(spawnSync).toHaveBeenCalledWith(
      'npx',
      [
        'eslint',
        '-f', 'json',
        '--no-inline-config',
        '--ext', '.ts, .tsx, .js, .jsx',
        '--no-error-on-unmatched-pattern',
        '-c', '.eslintrc.json',
        '.'
      ],
      { cwd: packageDirectory },
    );
  });

  test('When there is an eslint config file to analyse and the analysis shows some issue, an error status is returned', () => {
    spawnSync.mockReturnValue({ status: 1, stdout: JSON.stringify(eslintResultWithError) });
    getInput.mockReturnValue('true');

    const packageDirectory = '/path/to/project';
    const packageFile = `${packageDirectory}/.eslintrc.json`;
    const receivedStatus = runEslintWithConfigFile(packageFile);

    expect(receivedStatus).toStrictEqual({ status: 1, outcomes: eslintResultWithError });
    expect(spawnSync).toHaveBeenCalledWith(
      'npx',
      [
        'eslint',
        '-f', 'json',
        '--no-inline-config',
        '--ext', '.ts, .tsx, .js, .jsx',
        '--no-error-on-unmatched-pattern',
        '-c', '.eslintrc.json',
        '.'
      ],
      { cwd: packageDirectory },
    );
  });

  test('When the `ignoreInlineConfig` input is true, eslint is called with the `--no-inline-config` argument', () => {
    getInput.mockReturnValue('true');

    const packageDirectory = '/path/to/project';
    const packageFile = `${packageDirectory}/.eslintrc.json`;

    runEslintWithConfigFile(packageFile);

    expect(spawnSync).toHaveBeenCalledWith(
      'npx',
      [
        'eslint',
        '-f', 'json',
        '--no-inline-config',
        '--ext', '.ts, .tsx, .js, .jsx',
        '--no-error-on-unmatched-pattern',
        '-c', '.eslintrc.json',
        '.'
      ],
      { cwd: packageDirectory },
    );
  });

  test('When the `ignoreInlineConfig` input is false, eslint is called without the `--no-inline-config` argument', () => {
    getInput.mockReturnValue('false');

    const packageDirectory = '/path/to/project';
    const packageFile = `${packageDirectory}/.eslintrc.json`;

    runEslintWithConfigFile(packageFile);

    expect(spawnSync).toHaveBeenCalledWith(
      'npx',
      [
        'eslint',
        '-f', 'json',
        '--ext', '.ts, .tsx, .js, .jsx',
        '--no-error-on-unmatched-pattern',
        '-c', '.eslintrc.json',
        '.'
      ],
      { cwd: packageDirectory },
    );
  });
});
