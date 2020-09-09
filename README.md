# GitHub Action: Linter evaluator action

A GitHub action that evaluates projects with [eslint](https://eslint.org/) and comments the evaluation outcome on the student's pull request.

## Inputs

This action accepts the following configuration parameters via `with:`

- `token`

  **Required**

  The GitHub token to use for making API requests

## Example usage

```yaml
steps:
  - name: Static code analysis step
    uses: betrybe/eslint-linter-action
    with:
      token: ${{ secrets.GITHUB_TOKEN }}
```

## Development

Install the dependencies
```bash
$ npm install
```

Run the tests :heavy_check_mark:
```bash
$ npm test
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos. Packaging the action will create a packaged action in the dist folder.

Run package

```bash
npm run pack
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checking to the v1 release branch

```bash
$ git checkout -b v1
$ git commit -a -m "v1 release"
```

```bash
$ git push origin v1
```

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: betrybe/eslint-linter-action@v1
```

See the [actions tab](https://github.com/betrybe/eslint-linter-action/actions) for runs of this action! :rocket:
