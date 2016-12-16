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
  })
});
