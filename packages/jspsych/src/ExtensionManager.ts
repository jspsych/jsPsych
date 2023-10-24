import { Class } from "type-fest";

import { JsPsychExtension, JsPsychExtensionInfo } from "./modules/extensions";
import { TrialExtensionsConfiguration } from "./timeline";

export type GlobalExtensionsConfiguration = Array<{
  type: Class<JsPsychExtension>;
  params?: Record<string, any>;
}>;

export interface ExtensionManagerDependencies {
  /**
   * Given an extension class, create a new instance of it and return it.
   */
  instantiateExtension(extensionClass: Class<JsPsychExtension>): JsPsychExtension;
}

export class ExtensionManager {
  private static getExtensionNameByClass(extensionClass: Class<JsPsychExtension>) {
    return (extensionClass["info"] as JsPsychExtensionInfo).name;
  }

  public readonly extensions: Record<string, JsPsychExtension>;

  constructor(
    private dependencies: ExtensionManagerDependencies,
    private extensionsConfiguration: GlobalExtensionsConfiguration
  ) {
    this.extensions = Object.fromEntries(
      extensionsConfiguration.map((extension) => [
        ExtensionManager.getExtensionNameByClass(extension.type),
        this.dependencies.instantiateExtension(extension.type),
      ])
    );
  }

  private getExtensionInstanceByClass(extensionClass: Class<JsPsychExtension>) {
    return this.extensions[ExtensionManager.getExtensionNameByClass(extensionClass)];
  }

  public async initializeExtensions() {
    await Promise.all(
      this.extensionsConfiguration.map(({ type, params = {} }) =>
        this.getExtensionInstanceByClass(type).initialize(params)
      )
    );
  }

  public onStart(trialExtensionsConfiguration: TrialExtensionsConfiguration = []) {
    for (const { type, params } of trialExtensionsConfiguration) {
      this.getExtensionInstanceByClass(type)?.on_start(params);
    }
  }

  public onLoad(trialExtensionsConfiguration: TrialExtensionsConfiguration = []) {
    for (const { type, params } of trialExtensionsConfiguration) {
      this.getExtensionInstanceByClass(type)?.on_load(params);
    }
  }

  public async onFinish(
    trialExtensionsConfiguration: TrialExtensionsConfiguration = []
  ): Promise<Record<string, any>> {
    const results = await Promise.all(
      trialExtensionsConfiguration.map(({ type, params }) =>
        Promise.resolve(this.getExtensionInstanceByClass(type)?.on_finish(params))
      )
    );

    return Object.assign({}, ...results);
  }
}
