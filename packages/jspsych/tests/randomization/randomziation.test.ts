import {
  factorial,
  randomID,
  repeat,
  shuffle,
  shuffleAlternateGroups,
  shuffleNoRepeats,
} from "../../src/modules/randomization";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("#shuffle", () => {
  test("should produce fixed order with mock RNG", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const arr = [1, 2, 3, 4, 5, 6];
    expect(shuffle(arr)).toEqual([1, 6, 2, 5, 3, 4]);
  });
});

describe("shuffleAlternateGroups", () => {
  test("should shuffle in alternating groups", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    const toShuffle = [
      ["a", "b", "c"],
      [1, 2, 3],
    ];
    expect(shuffleAlternateGroups(toShuffle)).toEqual(["a", 1, "c", 3, "b", 2]);
  });
});

describe("#randomID", () => {
  test("should produce ID based on mock RNG", () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3);
    expect(randomID(3)).toBe("37a");
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

describe("shuffleNoRepeats", function () {
  test("should generate a random order with no repeats", function () {
    var equalityTest = (a, b) => a === b;
    var toShuffle = ["a", "b", "c", "d"];
    var repeated = repeat(toShuffle, 20);
    var randomOrder = shuffleNoRepeats(repeated, equalityTest);
    var repeats = 0;
    for (var i = 1; i < randomOrder.length; i++) {
      if (equalityTest(randomOrder[i], randomOrder[i - 1])) {
        repeats++;
      }
    }
    expect(repeats).toBe(0);
  });
});
