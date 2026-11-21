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

  describe("skips null and undefined values like #mean", () => {
    const withMissing = () =>
      new DataCollection([{ rt: 100 }, { rt: 300 }, { rt: null }, { rt: 200 }, {}]).select("rt");

    test("#mean", () => {
      expect(withMissing().mean()).toBe(200);
    });
    test("#median", () => {
      expect(withMissing().median()).toBe(200);
    });
    test("#min", () => {
      expect(withMissing().min()).toBe(100);
    });
    test("#max", () => {
      expect(new DataCollection([{ x: -300 }, { x: -100 }, { x: null }]).select("x").max()).toBe(
        -100
      );
    });
    test("#variance", () => {
      expect(withMissing().variance()).toBe(10000);
    });
    test("#sd", () => {
      expect(withMissing().sd()).toBe(100);
    });
    test("#median returns undefined when there are no valid values", () => {
      expect(
        new DataCollection([{ rt: null }, { rt: null }]).select("rt").median()
      ).toBeUndefined();
    });
  });
});
