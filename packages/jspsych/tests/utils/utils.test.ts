import { deepCopy, unique } from "../../src/modules/utils";

describe("unique", () => {
  test("generates unique array when there are duplicates", () => {
    const arr = [1, 1, 2, 2, 3, 3];
    const out = unique(arr);
    expect(out).toEqual([1, 2, 3]);
    expect(out).not.toEqual(arr);
  });

  test("generates same array when there are no duplicates", () => {
    const arr = [1, 2, 3];
    const out = unique(arr);
    expect(out).toEqual(arr);
  });
});

describe("deepCopy", () => {
  test("works for objects", () => {
    const o = { a: 1, b: { c: 2, d: 3 } };
    const o2 = deepCopy(o);
    o2.b.c = 4;
    expect(o.b.c).toBe(2);
  });
  test("works for objects with arrays", () => {
    const o = { a: 1, b: [2, 3] };
    const o2 = deepCopy(o);
    o2.b[0] = 4;
    expect(JSON.stringify(o2.b)).toBe(JSON.stringify([4, 3]));
    expect(o.b[0]).toBe(2);
  });
  test("works for objects with functions", () => {
    const o = {
      a: 1,
      b: () => {
        return 2;
      },
    };
    const o2 = deepCopy(o);
    o2.b = () => {
      return 1;
    };
    expect(o.b()).toBe(2);
    expect(o2.b()).toBe(1);
  });
});
