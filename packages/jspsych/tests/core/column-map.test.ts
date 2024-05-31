import { JsPsychData } from "src/modules/data";
import { JsPsych} from "../../src";


describe('jsPsych', () => {
  let jsPsychInstance;

  beforeEach(() => {
    jsPsychInstance = new JsPsych;
  });

  it('should map columns correctly', () => {
    const data = {
      oldColumn1: 'value1',
      oldColumn2: 'value2'
    };

    const trial = {
      column_map: {
        oldColumn1: 'newColumn1',
        oldColumn2: 'newColumn2'
      }
    };

    const expectedData = {
      newColumn1: 'value1',
      newColumn2: 'value2'
    };

    const result = jsPsychInstance.columnMap(data, trial);

    expect(result).toEqual(expectedData);
  });

  it('should handle empty data object', () => {
    const data = {};

    const trial = {
      column_map: {
        oldColumn1: 'newColumn1',
        oldColumn2: 'newColumn2'
      }
    };

    const expectedData = {};

    const result = jsPsychInstance.columnMap(data, trial);

    expect(result).toEqual(expectedData);
  });

  it('should handle empty column_map', () => {
    const data = {
      oldColumn1: 'value1',
      oldColumn2: 'value2'
    };

    const trial = {
      column_map: {}
    };

    const expectedData = {
      oldColumn1: 'value1',
      oldColumn2: 'value2'
    };

    const result = jsPsychInstance.columnMap(data, trial);

    expect(result).toEqual(expectedData);
  });

  it('should not fail if column_map contains non-existing keys', () => {
    const data = {
      oldColumn1: 'value1',
      oldColumn2: 'value2'
    };

    const trial = {
      column_map: {
        nonExistingKey: 'newColumn1'
      }
    };

    const expectedData = {
      oldColumn1: 'value1',
      oldColumn2: 'value2'
    };

   
    const result = jsPsychInstance.columnMap(data, trial);

    expect(result).toEqual(expectedData);
  });

  it('should overwrite existing data if new key already exists', () => {
    const data = {
      oldColumn1: 'value1',
      newColumn1: 'existingValue'
    };

    const trial = {
      column_map: {
        oldColumn1: 'newColumn1'
      }
    };

    const expectedData = {
      newColumn1: 'value1'
    };

    const result = jsPsychInstance.columnMap(data, trial);

    expect(result).toEqual(expectedData);
  });

/*
  it('should not be invoked when column_map property is not present', () => {

    const mockTrial = {
        type: {
            info: {
                name: 'mockPlugin'
            }
        }
    };

    let mockTimeline;

    mockTimeline =  {
        markCurrentTrialComplete: jest.fn(),
        advance: jest.fn(),
        trial: jest.fn().mockReturnValue(mockTrial),
        length: jest.fn()
    }
     const mockContext = {
        current_trial_finished: false,
        current_trial: {},
        timeline: {
            markCurrentTrialComplete: jest.fn().mockReturnValue([{}]),
            advance: jest.fn(),
            
        },
        data: {
          write: jest.fn(),
          getLastTrialData: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue([{}]),
          }),
        },
        DOM_target: {
          classList: {
            remove: jest.fn(),
          },
        },
        opts: {
          on_trial_finish: jest.fn(),
          on_data_update: jest.fn(),
          default_iti: 0,
        },
        internal: {
          call_immediate: false,
        },
        simulation_mode: '',
        nextTrial: jest.fn(),
        columnMap: jest.fn((data, trial) => data),
        extensions: {},
      };
      
      const inputData = { key: 'value' };

      jsPsychInstance.timeline = mockTimeline
      jsPsychInstance.doTrial = jest.fn();
      jsPsychInstance.write = jest.fn();
      jsPsychInstance.getProgress = jest.fn();
      jsPsychInstance.trial = mockTrial
  
      const columnMap = jest.spyOn(jsPsychInstance, 'columnMap');

      jsPsychInstance.simulation_mode = '';
  
      jsPsychInstance.finishTrial(inputData);
  
      expect(columnMap).not.toHaveBeenCalled();
      
});*/

});


