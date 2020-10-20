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

describe('DataCollection', function(){
  test('#filter', function(){
    expect(jsPsych.data.get().filter({filter: true}).count()).toBe(2);
  });
  test('#filter OR', function(){
    expect(jsPsych.data.get().filter([{filter: true}, {rt: 300}]).count()).toBe(2);
    expect(jsPsych.data.get().filter([{filter: true}, {rt: 200}]).count()).toBe(3);
  })
  test('#filterCustom', function(){
    expect(jsPsych.data.get().filterCustom(function(x){ return x.rt > 200 && x.filter == false}).count()).toBe(2);
  });
  test('#ignore', function(){
    expect(jsPsych.data.get().ignore('rt').select('rt').count()).toBe(0);
  });
  test('#select', function(){
    expect(JSON.stringify(jsPsych.data.get().select('rt').values)).toBe(JSON.stringify([100,200,300,400,500]));
  });
  test('#addToAll', function(){
    expect(jsPsych.data.get().readOnly().addToAll({added: 5}).select('added').count()).toBe(5);
  });
  test('#addToLast', function(){
    jsPsych.data.get().addToLast({lastonly: true});
    expect(jsPsych.data.get().values()[4].lastonly).toBe(true);
  });
  test('#readOnly', function(){
    var d = jsPsych.data.get().readOnly().values();
    d[0].rt = 0;
    expect(jsPsych.data.get().values()[0].rt).toBe(100);
  });
  test('not #readOnly', function(){
    var d = jsPsych.data.get().values();
    d[0].rt = 0;
    expect(jsPsych.data.get().values()[0].rt).toBe(0);
  });
  test('#count', function(){
    expect(jsPsych.data.get().count()).toBe(5);
  });
  test('#push', function(){
    jsPsych.data.get().push({rt: 600, filter: true});
    expect(jsPsych.data.get().count()).toBe(6);
    data = [
      {rt: 100, filter: true},
      {rt: 200, filter: false},
      {rt: 300, filter: true},
      {rt: 400, filter: false},
      {rt: 500, filter: false}
    ];
    jsPsych.data._customInsert(data);
  });
  test('#values', function(){
    expect(JSON.stringify(jsPsych.data.get().values())).toBe(JSON.stringify(data));
  });
  test('#first', function(){
    expect(jsPsych.data.get().first(3).count()).toBe(3);
    expect(jsPsych.data.get().first(2).values()[1].rt).toBe(200);
  });
  test('#last', function(){
    expect(jsPsych.data.get().last(2).count(2)).toBe(2);
    expect(jsPsych.data.get().last(2).values()[0].rt).toBe(400);
  });
  test('#join', function(){
    var dc1 = jsPsych.data.get().filter({filter: true});
    var dc2 = jsPsych.data.get().filter({rt: 500});
    var data = dc1.join(dc2);
    expect(data.count()).toBe(3);
    expect(data.values()[2].rt).toBe(500);
  });
  test('#unqiueNames', function(){
    var data = [
      {rt: 100, filter: true},
      {rt: 200, filter: false},
      {rt: 300, filter: true, v1: false},
      {rt: 400, filter: false, v2: true},
      {rt: 500, filter: false, v1: false}
    ];

    jsPsych.data._customInsert(data);
    expect(jsPsych.data.get().uniqueNames().length).toBe(4);
  })
});
