const getErrorsCount = (eslintOutcomes) => (
  eslintOutcomes.reduce((acc, { errorCount }) => acc + errorCount, 0)
);

const buildErrorMessage = ({ line, message }) => `- Linha **${line}**: ${message}`;

const buildFileSection = (filePath) => `#### Arquivo \`${filePath}\``;

const buildFileErrors = ({ errorCount, filePath, messages }, root) => {
  if (errorCount === 0) return '';

  const relativePathFile = filePath.replace(root, '');
  const fileSection = `${buildFileSection(relativePathFile)}\n\n`;

  return messages.reduce((acc, error) => acc + `${buildErrorMessage(error)}\n`, fileSection);
}

const listErrors = (eslintOutcomes, root) => (
  eslintOutcomes.reduce((acc, currentFile) => acc + buildFileErrors(currentFile, root), '')
);

const getSummaryMessage = (eslintOutcomes) => {
  const errorsCount = getErrorsCount(eslintOutcomes);

  if (errorsCount === 0) return '### Nenhum erro encontrado.';
  if (errorsCount === 1) return '### Foi encontrado 1 erro.';
  return `### Foram encontrados ${errorsCount} erros.`;
}

const buildFeedbackMessage = (eslintOutcomes, root) => {
  let feedbackMessage = getSummaryMessage(eslintOutcomes);

  if (feedbackMessage !== '### Nenhum erro encontrado.') {
    feedbackMessage = `${feedbackMessage}\n\n${listErrors(eslintOutcomes, root)}`;
  }

  return feedbackMessage;
}

module.exports = buildFeedbackMessage;
