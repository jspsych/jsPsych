require('../jspsych.js');

var data = [
  {rt: 100, filter: true},
  {rt: 200, filter: false},
  {rt: 300, filter: true},
  {rt: 400, filter: false},
  {rt: 500, filter: false}
];

jsPsych.data._customInsert(data);

describe('DataCollection', function(){
  test('#mean', function(){
    expect(jsPsych.data.getData().select('rt').mean()).toBe(300);
  });
  test('#count', function(){
    expect(jsPsych.data.getData().select('rt').count()).toBe(5);
  });
  test('#sd', function(){
    expect(jsPsych.data.getData().select('rt').sd()).toBe(Math.sqrt((Math.pow(200,2)+Math.pow(100,2)+Math.pow(100,2)+Math.pow(200,2))/5));
  });
  test('#median', function(){
    expect(jsPsych.data.getData().select('rt').median()).toBe(300);
  });
  test('#subset', function(){
    expect(jsPsych.data.getData().select('rt').subset(function(x){ return x > 300; }).count()).toBe(2);
  });
  test('#frequencies', function(){
    expect(jsPsych.data.getData().select('filter').frequencies()).toEqual({true:2, false: 3})
  });
});
