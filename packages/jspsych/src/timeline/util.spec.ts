import { ParameterObjectPathCache, parameterPathArrayToString } from "./util";

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

describe("ParameterObjectPathCache", () => {
  const rootObject = {
    object: {
      id: 1,
      nestedObject: { id: 2 },
    },
    array: [{ id: 3 }, { id: 4, nestedObject: { id: 5 } }],
    explicitlyUndefined: undefined,
  };

  let cache: ParameterObjectPathCache;

  beforeEach(() => {
    cache = new ParameterObjectPathCache();
    cache.initialize(rootObject);
  });

  describe("lookup()", () => {
    it("works with object properties", () => {
      expect(cache.lookup(["nonExistent"])).toEqual({ doesPathExist: false, value: undefined });

      expect(cache.lookup(["explicitlyUndefined"])).toEqual({
        doesPathExist: true,
        value: undefined,
      });

      expect(cache.lookup(["object"])).toEqual({
        doesPathExist: true,
        value: rootObject.object,
      });
    });

    it("works with nested object properties", () => {
      expect(cache.lookup(["object", "nestedObject"])).toEqual({
        doesPathExist: true,
        value: rootObject.object.nestedObject,
      });

      expect(cache.lookup(["nonExistent", "nonExistent"])).toEqual({
        doesPathExist: false,
        value: undefined,
      });
    });

    it("works with nested array indices", () => {
      expect(cache.lookup(["array", "0"])).toEqual({
        doesPathExist: true,
        value: rootObject.array[0],
      });

      expect(cache.lookup(["array", "1"])).toEqual({
        doesPathExist: true,
        value: rootObject.array[1],
      });

      expect(cache.lookup(["array", "2"])).toEqual({
        doesPathExist: false,
        value: undefined,
      });

      expect(cache.lookup(["array", "1", "nestedObject"])).toEqual({
        doesPathExist: true,
        value: rootObject.array[1].nestedObject,
      });
    });
  });

  describe("set()", () => {
    it("overrides paths of the root object", () => {
      cache.set(["object"], { nested: 1 });
      expect(cache.lookup(["object", "nested"])).toEqual({
        doesPathExist: true,
        value: 1,
      });

      cache.set(["object", "nested"], 2);
      expect(cache.lookup(["object", "nested"])).toEqual({
        doesPathExist: true,
        value: 2,
      });

      cache.set(["array"], [1]);
      expect(cache.lookup(["array", "0"])).toEqual({ doesPathExist: true, value: 1 });
    });
  });

  describe("reset()", () => {
    it("deletes all set entries", () => {
      cache.set(["object"], { nested: 1 });
      expect(cache.lookup(["object", "nested"])).toEqual({
        doesPathExist: true,
        value: 1,
      });

      cache.reset();
      expect(cache.lookup(["object", "nested"])).toEqual({
        doesPathExist: false,
        value: undefined,
      });
    });
  });
});
