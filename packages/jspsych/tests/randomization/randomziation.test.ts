import { randomID, shuffle, shuffleAlternateGroups } from "../../src/modules/randomization";

describe("#shuffle", () => {
  test("should produce fixed order with mock RNG", () => {
    Math.random = jest.fn().mockImplementation(() => {
      return 0.5;
    });
    var arr = [1, 2, 3, 4, 5, 6];
    expect(shuffle(arr)).toEqual([1, 6, 2, 5, 3, 4]);
  });
});

describe("shuffleAlternateGroups", () => {
  test("should shuffle in alternating groups", () => {
    Math.random = jest.fn().mockImplementation(() => {
      return 0.5;
    });
    var toShuffle = [
      ["a", "b", "c"],
      [1, 2, 3],
    ];
    expect(shuffleAlternateGroups(toShuffle)).toEqual(["a", 1, "c", 3, "b", 2]);
  });
});

describe("#randomID", () => {
  test("should produce ID based on mock RNG", () => {
    Math.random = jest
      .fn()
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.3);
    expect(randomID(3)).toBe("37a");
  });
});
