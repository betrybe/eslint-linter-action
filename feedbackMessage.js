const getErrorsCount = (eslintOutcomes) => (
  eslintOutcomes.reduce((acc, { errorCount }) => acc + errorCount, 0)
);

const buildFeedbackMessage = (eslintOutcomes) => {
  const errorsCount = getErrorsCount(eslintOutcomes);

  if (errorsCount === 0) return 'Nenhum erro encontrado.';
  if (errorsCount === 1) return 'Foi encontrado 1 erro.';
  return `Foram encontrados ${errorsCount} erros.`;
}

module.exports = buildFeedbackMessage;
