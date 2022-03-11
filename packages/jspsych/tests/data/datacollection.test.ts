import { DataCollection } from "../../src/modules/data/DataCollection";

describe("DataCollection", () => {
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

  test("filter", () => {
    expect(dataCollection.filter({ filter: true }).count()).toBe(2);
  });
  test("filter OR", () => {
    expect(dataCollection.filter([{ filter: true }, { rt: 300 }]).count()).toBe(2);
    expect(dataCollection.filter([{ filter: true }, { rt: 200 }]).count()).toBe(3);
  });
  test("filterCustom", () => {
    expect(
      dataCollection
        .filterCustom((x) => {
          return x.rt > 200 && x.filter == false;
        })
        .count()
    ).toBe(2);
  });

  test("filterColumns", () => {
    data = [
      { foo: "bar", rt: 100, filter: true },
      { foo: "bar", rt: 200, filter: false },
    ];
    dataCollection = new DataCollection(data);

    const filtered_data = dataCollection.filterColumns(["rt", "foo"]);

    expect(filtered_data.values()).toEqual([
      { foo: "bar", rt: 100 },
      { foo: "bar", rt: 200 },
    ]);
  });

  test("ignore", () => {
    expect(dataCollection.ignore("rt").select("rt").count()).toBe(0);
  });
  test("select", () => {
    expect(JSON.stringify(dataCollection.select("rt").values)).toBe(
      JSON.stringify([100, 200, 300, 400, 500])
    );
  });
  test("addToAll", () => {
    expect(dataCollection.readOnly().addToAll({ added: 5 }).select("added").count()).toBe(5);
  });
  test("addToLast", () => {
    dataCollection.addToLast({ lastonly: true });
    expect(dataCollection.values()[4].lastonly).toBe(true);
  });
  test("readOnly", () => {
    const d = dataCollection.readOnly().values();
    d[0].rt = 0;
    expect(dataCollection.values()[0].rt).toBe(100);
  });
  test("not readOnly", () => {
    const d = dataCollection.values();
    d[0].rt = 0;
    expect(dataCollection.values()[0].rt).toBe(0);
  });
  test("count", () => {
    expect(dataCollection.count()).toBe(5);
  });
  test("push", () => {
    dataCollection.push({ rt: 600, filter: true });
    expect(dataCollection.count()).toBe(6);
  });
  test("values", () => {
    expect(JSON.stringify(dataCollection.values())).toBe(JSON.stringify(data));
    expect(dataCollection.values()).toBe(data);
  });
  test("first", () => {
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
    const n = dataCollection.count();
    const too_many = n + 1;
    expect(dataCollection.first(too_many).count()).toBe(n);
  });
  test("last", () => {
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
    const n = dataCollection.count();
    const too_many = n + 1;
    expect(dataCollection.last(too_many).count()).toBe(n);
  });
  test("join", () => {
    const dc1 = dataCollection.filter({ filter: true });
    const dc2 = dataCollection.filter({ rt: 500 });
    const data = dc1.join(dc2);
    expect(data.count()).toBe(3);
    expect(data.values()[2].rt).toBe(500);
  });
  test("unqiueNames", () => {
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
