import { Class } from "type-fest";

import { TestExtension } from "../tests/extensions/test-extension";
import { ExtensionManager, ExtensionManagerDependencies } from "./ExtensionManager";
import { JsPsych } from "./JsPsych";
import { JsPsychExtension } from "./modules/extensions";

jest.mock("../src/JsPsych");

export class ExtensionManagerDependenciesMock implements ExtensionManagerDependencies {
  instantiateExtension: jest.Mock<JsPsychExtension>;

  jsPsych: JsPsych; // to be passed to extensions by `instantiateExtension`

  constructor() {
    this.initializeProperties();
  }

  private initializeProperties() {
    this.instantiateExtension = jest.fn(
      (extensionClass: Class<JsPsychExtension>) => new extensionClass(this.jsPsych)
    );

    this.jsPsych = new JsPsych();
  }

  reset() {
    this.initializeProperties();
  }
}

const dependencies = new ExtensionManagerDependenciesMock();
afterEach(() => {
  dependencies.reset();
});

describe("ExtensionManager", () => {
  it("instantiates all extensions upon construction", () => {
    new ExtensionManager(dependencies, [{ type: TestExtension }]);

    expect(dependencies.instantiateExtension).toHaveBeenCalledTimes(1);
    expect(dependencies.instantiateExtension).toHaveBeenCalledWith(TestExtension);
  });

  it("exposes extensions via the `extensions` property", () => {
    const manager = new ExtensionManager(dependencies, [{ type: TestExtension }]);

    expect(manager.extensions).toEqual({ test: expect.any(TestExtension) });
  });

  describe("initialize()", () => {
    it("calls `initialize` on all extensions, providing the parameters from the constructor", async () => {
      const manager = new ExtensionManager(dependencies, [
        { type: TestExtension, params: { option: 1 } },
      ]);

      await manager.initializeExtensions();

      expect(manager.extensions.test.initialize).toHaveBeenCalledTimes(1);
      expect(manager.extensions.test.initialize).toHaveBeenCalledWith({ option: 1 });
    });

    it("defaults `params` to an empty object", async () => {
      const manager = new ExtensionManager(dependencies, [{ type: TestExtension }]);

      await manager.initializeExtensions();
      expect(manager.extensions.test.initialize).toHaveBeenCalledWith({});
    });
  });

  describe("onStart()", () => {
    it("calls `on_start` on all extensions specified in the provided `extensions` parameter", () => {
      const manager = new ExtensionManager(dependencies, [{ type: TestExtension }]);

      const onStartCallback = jest.mocked(manager.extensions.test.on_start);

      manager.onStart();
      expect(onStartCallback).not.toHaveBeenCalled();

      manager.onStart([{ type: TestExtension, params: { my: "option" } }]);
      expect(onStartCallback).toHaveBeenCalledWith({ my: "option" });
    });
  });

  describe("onLoad()", () => {
    it("calls `on_load` on all extensions specified in the provided `extensions` parameter", () => {
      const manager = new ExtensionManager(dependencies, [{ type: TestExtension }]);

      const onLoadCallback = jest.mocked(manager.extensions.test.on_load);

      manager.onLoad();
      expect(onLoadCallback).not.toHaveBeenCalled();

      manager.onLoad([{ type: TestExtension, params: { my: "option" } }]);
      expect(onLoadCallback).toHaveBeenCalledWith({ my: "option" });
    });
  });

  describe("onFinish()", () => {
    it("calls `on_finish` on all extensions specified in the provided `extensions` parameter and returns a joint extension results object", async () => {
      const manager = new ExtensionManager(dependencies, [{ type: TestExtension }]);

      const onFinishCallback = jest.mocked(manager.extensions.test.on_finish);
      onFinishCallback.mockReturnValue({
        extension: "result",
      });

      let results = await manager.onFinish(undefined);
      expect(onFinishCallback).not.toHaveBeenCalled();
      expect(results).toEqual({});

      results = await manager.onFinish([{ type: TestExtension, params: { my: "option" } }]);
      expect(onFinishCallback).toHaveBeenCalledWith({ my: "option" });
      expect(results).toEqual({
        extension_type: ["test"],
        extension_version: ["0.0.1"],
        extension: "result",
      });
    });
  });
});
