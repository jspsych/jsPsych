import { DataCollection } from "../../src/modules/data/DataCollection";

const data = [
  { rt: 100, filter: true },
  { rt: 200, filter: false },
  { rt: 300, filter: true },
  { rt: 400, filter: false },
  { rt: 500, filter: false },
];

describe("DataColumn", function () {
  let dataCollection: DataCollection;
  beforeEach(() => {
    dataCollection = new DataCollection(data);
  });

  test("#sum", function () {
    expect(dataCollection.select("rt").sum()).toBe(1500);
  });
  test("#mean", function () {
    expect(dataCollection.select("rt").mean()).toBe(300);
  });
  test("#count", function () {
    expect(dataCollection.select("rt").count()).toBe(5);
  });
  test("#min", function () {
    expect(dataCollection.select("rt").min()).toBe(100);
  });
  test("#max", function () {
    expect(dataCollection.select("rt").max()).toBe(500);
  });
  test("#variance", function () {
    expect(dataCollection.select("rt").variance()).toBe(
      (Math.pow(200, 2) + Math.pow(100, 2) + Math.pow(100, 2) + Math.pow(200, 2)) / (5 - 1)
    );
  });
  test("#sd", function () {
    expect(dataCollection.select("rt").sd()).toBe(
      Math.sqrt(
        (Math.pow(200, 2) + Math.pow(100, 2) + Math.pow(100, 2) + Math.pow(200, 2)) / (5 - 1)
      )
    );
  });
  test("#median", function () {
    expect(dataCollection.select("rt").median()).toBe(300);
  });
  test("#subset", function () {
    expect(
      dataCollection
        .select("rt")
        .subset(function (x) {
          return x > 300;
        })
        .count()
    ).toBe(2);
  });
  test("#frequencies", function () {
    expect(dataCollection.select("filter").frequencies()).toEqual({ true: 2, false: 3 });
  });
  test("#all", function () {
    expect(
      dataCollection.select("rt").all(function (x) {
        return x < 600;
      })
    ).toBe(true);
    expect(
      dataCollection.select("filter").all(function (x) {
        return x;
      })
    ).toBe(false);
  });
});
