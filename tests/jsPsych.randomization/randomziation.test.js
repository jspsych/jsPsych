const root = '../../';

require(root + 'jspsych.js');


describe('#shuffle', function(){
  test('should produce fixed order with mock RNG', function(){
    Math.random = jest.fn().mockImplementation(function(){ return 0.5; });
    var arr = [1,2,3,4,5,6];
    expect(jsPsych.randomization.shuffle(arr)).toEqual([1,6,2,5,3,4]);
  });
});

describe('shuffleAlternateGroups', function(){
  test('should shuffle in alternating groups', function(){
    Math.random = jest.fn().mockImplementation(function(){ return 0.5; });
    var toShuffle = [['a','b','c',], [1,2,3]];
    expect(jsPsych.randomization.shuffleAlternateGroups(toShuffle)).toEqual(['a',1,'c',3,'b',2]);
  });
})

describe('#randomID', function(){
  test('should produce ID based on mock RNG', function(){
    Math.random = jest.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0.2).mockReturnValueOnce(0.3);
    expect(jsPsych.randomization.randomID(3)).toBe("37a");
  });
});
