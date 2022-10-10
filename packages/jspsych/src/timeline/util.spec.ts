import { parameterPathArrayToString } from "./util";

describe("parameterPathArrayToString()", () => {
  it("works with flat paths", () => {
    expect(parameterPathArrayToString(["flat"])).toEqual("flat");
  });

  it("works with nested object paths", () => {
    expect(parameterPathArrayToString(["nested", "object", "path"])).toEqual("nested.object.path");
  });

  it("works with array indices", () => {
    expect(parameterPathArrayToString(["arrayElement", "10"])).toEqual("arrayElement[10]");
  });

  it("works with nested object paths and array indices", () => {
    expect(parameterPathArrayToString(["nested", "arrayElement", "10", "property"])).toEqual(
      "nested.arrayElement[10].property"
    );
  });
});
