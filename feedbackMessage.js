const getErrorsCount = (eslintOutcomes) => (
  eslintOutcomes.reduce((acc, { errorCount }) => acc + errorCount, 0)
);

const buildErrorMessage = ({ line, message }) => `- Linha **${line}**: ${message}`;

const buildFileSection = ({ filePath }) => `### Arquivo \`${filePath}\``;

const buildFileErrors = (currentFile) => {
  if (currentFile.errorCount === 0) return '';
  const fileSection = `${buildFileSection(currentFile)}\n\n`;
  return (currentFile.messages.reduce((acc, error) => acc + `${buildErrorMessage(error)}\n`, fileSection));
}

const listErrors = (eslintOutcomes) => (
  eslintOutcomes.reduce((acc, currentFile) => acc + `${buildFileErrors(currentFile)}\n`, '')
);

const getSummaryMessage = (eslintOutcomes) => {
  const errorsCount = getErrorsCount(eslintOutcomes);

  if (errorsCount === 0) return 'Nenhum erro encontrado.';
  if (errorsCount === 1) return 'Foi encontrado 1 erro.';
  return `Foram encontrados ${errorsCount} erros.`;
}

const buildFeedbackMessage = (eslintOutcomes) => {
  const summaryMessage = getSummaryMessage(eslintOutcomes);
  const teste = listErrors(eslintOutcomes);
  return `${summaryMessage}\n\n${teste}`;
}

module.exports = buildFeedbackMessage;
