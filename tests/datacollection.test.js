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
  test('#filter', function(){
    expect(jsPsych.data.getData().filter({filter: true}).count()).toBe(2);
  });
  test('#filterCustom', function(){
    expect(jsPsych.data.getData().filterCustom(function(x){ return x.rt > 200 && x.filter == false}).count()).toBe(2);
  });
  test('#ignore', function(){
    expect(jsPsych.data.getData().ignore('rt').select('rt').count()).toBe(0);
  });
  test('#select', function(){
    expect(JSON.stringify(jsPsych.data.getData().select('rt').values)).toBe(JSON.stringify([100,200,300,400,500]));
  })

  // addToAll
  // addToLast
  // readOnly
  // push
  // count
  // values
});
