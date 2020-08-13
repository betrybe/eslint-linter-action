const getErrorsCount = (eslintOutcomes) => (
  eslintOutcomes.reduce((acc, { errorCount }) => acc + errorCount, 0)
);

const buildErrorMessage = ({ line, message }) => `- Linha **${line}**: ${message}`;

const buildFileSection = ({ filePath }, root) => {
  const relativePath = filePath.replace(root, '');

  return `#### Arquivo \`${relativePath}\``;
};

const buildFileErrors = (currentFile, root) => {
  if (currentFile.errorCount === 0) return '';
  const fileSection = `${buildFileSection(currentFile, root)}\n\n`;
  return (currentFile.messages.reduce((acc, error) => acc + `${buildErrorMessage(error)}\n`, fileSection));
}

const listErrors = (eslintOutcomes, root) => (
  eslintOutcomes.reduce((acc, currentFile) => acc + `${buildFileErrors(currentFile, root)}\n`, '')
);

const getSummaryMessage = (eslintOutcomes) => {
  const errorsCount = getErrorsCount(eslintOutcomes);

  if (errorsCount === 0) return '### Nenhum erro encontrado.';
  if (errorsCount === 1) return '### Foi encontrado 1 erro.';
  return `### Foram encontrados ${errorsCount} erros.`;
}

const buildFeedbackMessage = (eslintOutcomes, root) => {
  const summaryMessage = getSummaryMessage(eslintOutcomes);
  const teste = listErrors(eslintOutcomes, root);
  return `${summaryMessage}\n\n${teste}`;
}

module.exports = buildFeedbackMessage;
