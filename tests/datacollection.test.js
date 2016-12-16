require('../jspsych.js');

var data = [
  {rt: 100},
  {rt: 200},
  {rt: 300},
  {rt: 400},
  {rt: 500}
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
    expect(jsPsych.data.getData().select('rt').sd()).toBe(sqrt((200^2+100^2)*2));
  });
  test('#median', function(){
    expect(jsPsych.data.getData().select('rt').median()).toBe(300);
  });
  test('#subset', function(){
    expect(jsPsych.data.getData().select('rt').subset(function(x){ return x > 300; }).count()).toBe(2);
  })
});
