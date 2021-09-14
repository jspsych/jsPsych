import {
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
    var arr = [1, 2, 3, 4, 5, 6];
    expect(shuffle(arr)).toEqual([1, 6, 2, 5, 3, 4]);
  });
});

describe("shuffleAlternateGroups", () => {
  test("should shuffle in alternating groups", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    var toShuffle = [
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
