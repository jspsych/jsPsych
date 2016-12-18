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
  });
  test('#addToAll', function(){
    expect(jsPsych.data.getData().readOnly().addToAll({added: 5}).select('added').count()).toBe(5);
  });
  test('#addToLast', function(){
    jsPsych.data.getData().addToLast({lastonly: true});
    expect(jsPsych.data.getData().values()[4].lastonly).toBe(true);
  });
  test('#readOnly', function(){
    var d = jsPsych.data.getData().readOnly().values();
    d[0].rt = 0;
    expect(jsPsych.data.getData().values()[0].rt).toBe(100);
  });
  test('not #readOnly', function(){
    var d = jsPsych.data.getData().values();
    d[0].rt = 0;
    expect(jsPsych.data.getData().values()[0].rt).toBe(0);
  });
  test('#count', function(){
    expect(jsPsych.data.getData().count()).toBe(5);
  });
  test('#push', function(){
    jsPsych.data.getData().push({rt: 600, filter: true});
    expect(jsPsych.data.getData().count()).toBe(6);
  });
  test('#values', function(){
    expect(JSON.stringify(jsPsych.data.getData().values())).toBe(JSON.stringify(data));
  });
});
