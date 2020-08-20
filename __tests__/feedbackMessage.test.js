const buildFeedbackMessage = require('../feedbackMessage');
const noError = require('./fixtures/eslint-results/frontEndNoError.json');
const oneError = require('./fixtures/eslint-results/oneError.json');
const multipleErrorsOneFile = require('./fixtures/eslint-results/multipleErrorsOneFile.json');
const multipleErrorsMultipleFiles = require('./fixtures/eslint-results/multipleErrorsMultipleFiles.json');

describe('Feedback message', () => {
  describe('No error is found', () => {
    test('When there is no file to be evaluated, a no error encountered message is returned', () => {
      expect(buildFeedbackMessage([], './')).toBe('### Nenhum erro encontrado.')
    });

    test('When there are files to be evaluated, a no error encountered message is returned', () => {
      expect(buildFeedbackMessage(noError, './')).toBe('### Nenhum erro encontrado.')
    });
  });

  test('When one error is found, a message showing the error is returned', () => {
    expect(buildFeedbackMessage(oneError, './')).toBe(
      '### Foi encontrado 1 erro.\n' +
      '\n' +
      '#### Arquivo `/my-project/index.js`\n' +
      '\n' +
      '- Linha **1**: Function \'isPentagon\' has too many parameters (5). Maximum allowed is 4.\n'
    );
  });

  describe('Multiple errors are found', () => {
    test('When all errors are contained in one file, a message listing all those errors is returned', () => {
      expect(buildFeedbackMessage(multipleErrorsOneFile, './')).toBe(
        '### Foram encontrados 4 erros.\n' +
        '\n' +
        '#### Arquivo `/my-react-project/src/components/Greeting.js`\n' +
        '\n' +
        '- Linha **3**: \'name\' is missing in props validation\n' +
        '- Linha **3**: `Hello, ` must be placed on a new line\n' +
        '- Linha **3**: `{name}` must be placed on a new line\n' +
        '- Linha **5**: Missing semicolon.\n'
      );
    });

    test('When the errors span multiple files, a message listing all those errors is returned', () => {
      expect(buildFeedbackMessage(multipleErrorsMultipleFiles, './')).toBe(
        '### Foram encontrados 4 erros.\n' +
        '\n' +
        '#### Arquivo `/my-react-project/src/App.js`\n' +
        '\n' +
        '- Linha **2**: `react` import should occur before import of `./components/Greeting`\n' +
        '- Linha **12**: `code` must be placed on a new line\n' +
        '- Linha **24**: Expected indentation of 6 space characters but found 4.\n' +
        '' +
        '#### Arquivo `/my-react-project/src/components/Greeting.js`\n' +
        '\n' +
        '- Linha **3**: \'name\' is missing in props validation\n'
      );
    });
  });

  test('The root directory path for the project isn\'t displayed for each file', () => {
    expect(buildFeedbackMessage(multipleErrorsMultipleFiles, '/my-react-project')).toBe(
      '### Foram encontrados 4 erros.\n' +
      '\n' +
      '#### Arquivo `/src/App.js`\n' +
      '\n' +
      '- Linha **2**: `react` import should occur before import of `./components/Greeting`\n' +
      '- Linha **12**: `code` must be placed on a new line\n' +
      '- Linha **24**: Expected indentation of 6 space characters but found 4.\n' +
      '' +
      '#### Arquivo `/src/components/Greeting.js`\n' +
      '\n' +
      '- Linha **3**: \'name\' is missing in props validation\n'
    );
  });
});
