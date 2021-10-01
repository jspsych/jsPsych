import { DataCollection } from "../../src/modules/data/DataCollection";

const data = [
  { rt: 100, filter: true },
  { rt: 200, filter: false },
  { rt: 300, filter: true },
  { rt: 400, filter: false },
  { rt: 500, filter: false },
];

describe("DataColumn", () => {
  let dataCollection: DataCollection;
  beforeEach(() => {
    dataCollection = new DataCollection(data);
  });

  test("#sum", () => {
    expect(dataCollection.select("rt").sum()).toBe(1500);
  });
  test("#mean", () => {
    expect(dataCollection.select("rt").mean()).toBe(300);
  });
  test("#count", () => {
    expect(dataCollection.select("rt").count()).toBe(5);
  });
  test("#min", () => {
    expect(dataCollection.select("rt").min()).toBe(100);
  });
  test("#max", () => {
    expect(dataCollection.select("rt").max()).toBe(500);
  });
  test("#variance", () => {
    expect(dataCollection.select("rt").variance()).toBe(
      (Math.pow(200, 2) + Math.pow(100, 2) + Math.pow(100, 2) + Math.pow(200, 2)) / (5 - 1)
    );
  });
  test("#sd", () => {
    expect(dataCollection.select("rt").sd()).toBe(
      Math.sqrt(
        (Math.pow(200, 2) + Math.pow(100, 2) + Math.pow(100, 2) + Math.pow(200, 2)) / (5 - 1)
      )
    );
  });
  test("#median", () => {
    expect(dataCollection.select("rt").median()).toBe(300);
  });
  test("#subset", () => {
    expect(
      dataCollection
        .select("rt")
        .subset((x) => {
          return x > 300;
        })
        .count()
    ).toBe(2);
  });
  test("#frequencies", () => {
    expect(dataCollection.select("filter").frequencies()).toEqual({ true: 2, false: 3 });
  });
  test("#all", () => {
    expect(
      dataCollection.select("rt").all((x) => {
        return x < 600;
      })
    ).toBe(true);
    expect(
      dataCollection.select("filter").all((x) => {
        return x;
      })
    ).toBe(false);
  });
});
