const root = '../../';

require(root + 'jspsych.js');

var data = [
  {rt: 100, filter: true},
  {rt: 200, filter: false},
  {rt: 300, filter: true},
  {rt: 400, filter: false},
  {rt: 500, filter: false}
];

jsPsych.data._customInsert(data);

describe('DataColumn', function(){
  test('#sum', function(){
    expect(jsPsych.data.get().select('rt').sum()).toBe(1500);
  });
  test('#mean', function(){
    expect(jsPsych.data.get().select('rt').mean()).toBe(300);
  });
  test('#count', function(){
    expect(jsPsych.data.get().select('rt').count()).toBe(5);
  });
  test('#min', function(){
    expect(jsPsych.data.get().select('rt').min()).toBe(100);
  });
  test('#max', function(){
    expect(jsPsych.data.get().select('rt').max()).toBe(500);
  });
  test('#variance', function(){
    expect(jsPsych.data.get().select('rt').variance()).toBe((Math.pow(200,2)+Math.pow(100,2)+Math.pow(100,2)+Math.pow(200,2))/(5-1));
  });
  test('#sd', function(){
    expect(jsPsych.data.get().select('rt').sd()).toBe(Math.sqrt((Math.pow(200,2)+Math.pow(100,2)+Math.pow(100,2)+Math.pow(200,2))/(5-1)));
  });
  test('#median', function(){
    expect(jsPsych.data.get().select('rt').median()).toBe(300);
  });
  test('#subset', function(){
    expect(jsPsych.data.get().select('rt').subset(function(x){ return x > 300; }).count()).toBe(2);
  });
  test('#frequencies', function(){
    expect(jsPsych.data.get().select('filter').frequencies()).toEqual({true:2, false: 3})
  });
  test('#all', function(){
    expect(jsPsych.data.get().select('rt').all(function(x){ return x < 600})).toBe(true);
    expect(jsPsych.data.get().select('filter').all(function(x){ return x; })).toBe(false);
  });
});
