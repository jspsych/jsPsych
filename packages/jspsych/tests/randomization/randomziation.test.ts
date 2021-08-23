import {
  factorial,
  randomID,
  repeat,
  shuffle,
  shuffleAlternateGroups,
} from "../../src/modules/randomization";

describe("#shuffle", () => {
  test("should produce fixed order with mock RNG", () => {
    const spy = jest.spyOn(Math, "random").mockImplementation(() => {
      return 0.5;
    });
    const arr = [1, 2, 3, 4, 5, 6];
    expect(shuffle(arr)).toEqual([1, 6, 2, 5, 3, 4]);
    spy.mockRestore();
  });
});

describe("shuffleAlternateGroups", () => {
  test("should shuffle in alternating groups", () => {
    const spy = jest.spyOn(Math, "random").mockImplementation(() => {
      return 0.5;
    });
    const toShuffle = [
      ["a", "b", "c"],
      [1, 2, 3],
    ];
    expect(shuffleAlternateGroups(toShuffle)).toEqual(["a", 1, "c", 3, "b", 2]);
    spy.mockRestore();
  });
});

describe("#randomID", () => {
  test("should produce ID based on mock RNG", () => {
    const spy = jest.spyOn(Math, "random").mockImplementation(() => {
      return 0.5;
    });
    expect(randomID(3)).toBe("hhh");
    spy.mockRestore();
  });
});

describe("repeat", () => {
  test("repeats an array 2 times", () => {
    const arr = [1, 2, 3];
    const n = 2;

    const out = repeat(arr, n);

    expect(out.filter((x) => x == 1).length).toBe(2);
    expect(out.filter((x) => x == 2).length).toBe(2);
    expect(out.filter((x) => x == 3).length).toBe(2);
  });

  test("repeats an array 5 times", () => {
    const arr = [1, 2, 3];
    const n = 5;

    const out = repeat(arr, n);

    expect(out.filter((x) => x == 1).length).toBe(5);
    expect(out.filter((x) => x == 2).length).toBe(5);
    expect(out.filter((x) => x == 3).length).toBe(5);
  });
});

describe("factorial", () => {
  test("produces a factorial design with 2 factors", () => {
    const factors = {
      stimulus: ["a", "b"],
      ms_delay: [100, 200],
    };

    const full_design = factorial(factors);

    expect(full_design).toContainEqual({ stimulus: "a", ms_delay: 100 });
    expect(full_design).toContainEqual({ stimulus: "a", ms_delay: 200 });
    expect(full_design).toContainEqual({ stimulus: "b", ms_delay: 100 });
    expect(full_design).toContainEqual({ stimulus: "b", ms_delay: 200 });

    expect(full_design).toHaveLength(4);
  });

  test("produces a factorial design with 3 factors", () => {
    const factors = {
      stimulus: ["a", "b"],
      ms_delay: [100, 200],
      cond: [1, 2],
    };

    const full_design = factorial(factors);

    expect(full_design).toContainEqual({ stimulus: "a", ms_delay: 100, cond: 1 });
    expect(full_design).toContainEqual({ stimulus: "a", ms_delay: 200, cond: 1 });
    expect(full_design).toContainEqual({ stimulus: "b", ms_delay: 100, cond: 1 });
    expect(full_design).toContainEqual({ stimulus: "b", ms_delay: 200, cond: 1 });
    expect(full_design).toContainEqual({ stimulus: "a", ms_delay: 100, cond: 2 });
    expect(full_design).toContainEqual({ stimulus: "a", ms_delay: 200, cond: 2 });
    expect(full_design).toContainEqual({ stimulus: "b", ms_delay: 100, cond: 2 });
    expect(full_design).toContainEqual({ stimulus: "b", ms_delay: 200, cond: 2 });

    expect(full_design).toHaveLength(8);
  });

  test("produces a factorial design with repetition", () => {
    const factors = {
      stimulus: ["a", "b"],
      ms_delay: [100, 200],
    };

    const full_design: Array<any> = factorial(factors, 2);

    const count = full_design.filter((x) => {
      return x.stimulus == "a" && x.ms_delay == 100;
    }).length;

    expect(count).toBe(2);
  });
});
