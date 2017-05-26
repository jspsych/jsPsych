const root = '../../';

require(root + 'jspsych.js');

describe('unique', function(){
  test('generates unique array when there are duplicates', function(){
    var arr = [1,1,2,2,3,3];
    var out = jsPsych.utils.unique(arr);
    expect(out).toEqual([1,2,3]);
    expect(out).not.toEqual(arr);
  });

  test('generates same array when there are no duplicates', function(){
    var arr = [1,2,3];
    var out = jsPsych.utils.unique(arr);
    expect(out).toEqual(arr);
  })
});

describe('flatten', function(){
  test('generates flat array from flat input', function(){
    var arr = [1,1,2,2,3,3];
    var out = jsPsych.utils.flatten(arr);
    expect(out).toEqual(arr);
  });

  test('generates flat array from nested input', function(){
    var arr = [1,[1,2,2],[3],3];
    var out = jsPsych.utils.flatten(arr);
    expect(out).toEqual([1,1,2,2,3,3]);
  });
});
