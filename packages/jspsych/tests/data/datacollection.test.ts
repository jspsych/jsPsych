import { DataCollection } from "../../src/modules/data/DataCollection";

describe("DataCollection", function () {
  let dataCollection: DataCollection;
  let data: any;

  beforeEach(() => {
    data = [
      { rt: 100, filter: true },
      { rt: 200, filter: false },
      { rt: 300, filter: true },
      { rt: 400, filter: false },
      { rt: 500, filter: false },
    ];
    dataCollection = new DataCollection(data);
  });

  test("#filter", function () {
    expect(dataCollection.filter({ filter: true }).count()).toBe(2);
  });
  test("#filter OR", function () {
    expect(dataCollection.filter([{ filter: true }, { rt: 300 }]).count()).toBe(2);
    expect(dataCollection.filter([{ filter: true }, { rt: 200 }]).count()).toBe(3);
  });
  test("#filterCustom", function () {
    expect(
      dataCollection
        .filterCustom(function (x) {
          return x.rt > 200 && x.filter == false;
        })
        .count()
    ).toBe(2);
  });
  test("#ignore", function () {
    expect(dataCollection.ignore("rt").select("rt").count()).toBe(0);
  });
  test("#select", function () {
    expect(JSON.stringify(dataCollection.select("rt").values)).toBe(
      JSON.stringify([100, 200, 300, 400, 500])
    );
  });
  test("#addToAll", function () {
    expect(dataCollection.readOnly().addToAll({ added: 5 }).select("added").count()).toBe(5);
  });
  test("#addToLast", function () {
    dataCollection.addToLast({ lastonly: true });
    expect(dataCollection.values()[4].lastonly).toBe(true);
  });
  test("#readOnly", function () {
    var d = dataCollection.readOnly().values();
    d[0].rt = 0;
    expect(dataCollection.values()[0].rt).toBe(100);
  });
  test("not #readOnly", function () {
    var d = dataCollection.values();
    d[0].rt = 0;
    expect(dataCollection.values()[0].rt).toBe(0);
  });
  test("#count", function () {
    expect(dataCollection.count()).toBe(5);
  });
  test("#push", function () {
    dataCollection.push({ rt: 600, filter: true });
    expect(dataCollection.count()).toBe(6);
  });
  test("#values", function () {
    expect(JSON.stringify(dataCollection.values())).toBe(JSON.stringify(data));
    expect(dataCollection.values()).toBe(data);
  });
  test("#first", function () {
    expect(dataCollection.first(3).count()).toBe(3);
    expect(dataCollection.first(2).values()[1].rt).toBe(200);
    expect(dataCollection.first().count()).toBe(1);
    expect(() => {
      dataCollection.first(-1);
    }).toThrow();
    expect(() => {
      dataCollection.first(0);
    }).toThrow();
    expect(dataCollection.filter({ foo: "bar" }).first(1).count()).toBe(0);
    var n = dataCollection.count();
    var too_many = n + 1;
    expect(dataCollection.first(too_many).count()).toBe(n);
  });
  test("#last", function () {
    expect(dataCollection.last(2).count()).toBe(2);
    expect(dataCollection.last(2).values()[0].rt).toBe(400);
    expect(dataCollection.last().count()).toBe(1);
    expect(() => {
      dataCollection.last(-1);
    }).toThrow();
    expect(() => {
      dataCollection.last(0);
    }).toThrow();
    expect(dataCollection.filter({ foo: "bar" }).last(1).count()).toBe(0);
    var n = dataCollection.count();
    var too_many = n + 1;
    expect(dataCollection.last(too_many).count()).toBe(n);
  });
  test("#join", function () {
    const dc1 = dataCollection.filter({ filter: true });
    const dc2 = dataCollection.filter({ rt: 500 });
    const data = dc1.join(dc2);
    expect(data.count()).toBe(3);
    expect(data.values()[2].rt).toBe(500);
  });
  test("#unqiueNames", function () {
    expect(
      new DataCollection([
        { rt: 100, filter: true },
        { rt: 200, filter: false },
        { rt: 300, filter: true, v1: false },
        { rt: 400, filter: false, v2: true },
        { rt: 500, filter: false, v1: false },
      ]).uniqueNames().length
    ).toBe(4);
  });
});
