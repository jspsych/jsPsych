//const jsPsych = require('../jsPsych'); // Adjust the path as necessary
import {JsPsych} from '../../src';

describe('jsPsych', () => {
  let jsPsychInstance;
  let dataMock;
  let metadataMock;

  beforeEach(() => {
    dataMock = {
      getVariablesToBeUpdated: jest.fn(),
      get: jest.fn().mockReturnValue({
        select: jest.fn()
      }),
      getLevels: jest.fn()
    };

    metadataMock = {
      setVariable: jest.fn()
    };

    jsPsychInstance = new JsPsych;
    jsPsychInstance.data = dataMock;
    jsPsychInstance.metadata = metadataMock;
   
  });

  test('should generate metadata for string variables', () => {
    dataMock.getVariablesToBeUpdated.mockReturnValue(['variable1']);
    dataMock.get().select.mockReturnValue({ values: ['a', 'b', 'c'] });
    dataMock.getLevels.mockReturnValue(['a', 'b', 'c']);

    jsPsychInstance.getAutomaticMetaData();

    expect(metadataMock.setVariable).toHaveBeenCalledWith({
      name: 'variable1',
      description: 'Unknown',
      value: 'string',
      levels: ['a', 'b', 'c']
    });
  });

  test('should generate metadata for numeric variables', () => {
    dataMock.getVariablesToBeUpdated.mockReturnValue(['variable2']);
    dataMock.get().select.mockReturnValue({ values: [1, 2, 3] });

    jsPsychInstance.getAutomaticMetaData();

    expect(metadataMock.setVariable).toHaveBeenCalledWith({
      name: 'variable2',
      description: 'Unknown',
      value: 'number'
    });
  });

  test('should skip null values in determining the variable type', () => {
    dataMock.getVariablesToBeUpdated.mockReturnValue(['variable3']);
    dataMock.get().select.mockReturnValue({ values: [null, 1, 2, 3] });

    jsPsychInstance.getAutomaticMetaData();

    expect(metadataMock.setVariable).toHaveBeenCalledWith({
      name: 'variable3',
      description: 'Unknown',
      value: 'number'
    });
  });

  test('should handle empty variable values array', () => {
    dataMock.getVariablesToBeUpdated.mockReturnValue(['variable4']);
    dataMock.get().select.mockReturnValue({ values: [] });

    jsPsychInstance.getAutomaticMetaData();

    expect(metadataMock.setVariable).toHaveBeenCalledWith({
        name: 'variable4',
        description: 'Unknown',
        value: 'undefined'
      });
  });
});
