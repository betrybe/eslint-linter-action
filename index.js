const core = require('@actions/core');
const github = require('@actions/github');
const buildFeedbackMessage = require('./feedbackMessage');
const runEslint = require('./runEslint');
const runNpm = require('./runNpm');

const run = async () => {
  try {
    const root = process.env.GITHUB_WORKSPACE || process.cwd();
    const token = core.getInput('token', { required: true });
    const client = github.getOctokit(token);
    const { owner, repo } = github.context.issue;
    const npmStatus = runNpm(root);
    const { status: eslintStatus, outcomes: eslintOutcomes } = runEslint(root);
    const status = npmStatus + eslintStatus;
    const feedbackMessage = buildFeedbackMessage(eslintOutcomes, root);

    console.log('Exit code:', status);
    console.log('All errors:', eslintOutcomes);
    console.log('Feedback message:\n', feedbackMessage);

    await client.rest.issues.createComment({
      owner,
      repo,
      issue_number: process.env.INPUT_PR_NUMBER,
      body: feedbackMessage,
    });

    process.exit(status);
  } catch (error) {
    if (error.message.match(/Unexpected end of JSON input.*/)) {
      core.summary
        .addHeading('❌ Erro ao rodar o ESLint')
        .addRaw('Remova o arquivo `package-lock.json` e tente rodar novamente o comando `npm install`. Se o erro persistir, contate o time Trybe')
        .write();
    } else {
      core.setFailed(error.message);
    }
  }
};

run();
