/**
 * Maintains a promise and offers a function to resolve it. Whenever the promise is resolved, it is
 * replaced with a new one.
 */
export class PromiseWrapper<ResolveType = void> {
  constructor() {
    this.reset();
  }

  private promise: Promise<ResolveType>;
  private resolvePromise: (resolveValue: ResolveType) => void;

  reset() {
    this.promise = new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }
  get() {
    return this.promise;
  }
  resolve(value: ResolveType) {
    this.resolvePromise(value);
    this.reset();
  }
}

export function isPromise(value: any): value is Promise<any> {
  return value && typeof value["then"] === "function";
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns the string representation of a `path` array like accepted by lodash's `get` and `set`
 * functions.
 */
export function parameterPathArrayToString([firstPathElement, ...remainingPathElements]: string[]) {
  let pathString = firstPathElement ?? "";

  for (const pathElement of remainingPathElements) {
    pathString += Number.isNaN(Number.parseInt(pathElement))
      ? `.${pathElement}`
      : `[${pathElement}]`;
  }

  return pathString;
}

function isObjectOrArray(value: any): value is Record<string, any> | any[] {
  return typeof value === "object" && value !== null;
}

type LookupResult = { doesPathExist: boolean; value?: any };

/**
 * Initialized with an object, provides a `lookup` method to look up nested object and array paths
 * and a `set` method to override the element that `lookup` uses at a given path. The original
 * object remains unmodified. All looked up values are cached, including those at intermediate
 * paths. This means, `set`ting the element at a path only affects nested path lookups if the paths
 * have not been looked up and cached before.
 */
export class ParameterObjectPathCache {
  private static lookupChild(
    objectOrArray: Record<string, any> | any[],
    childName: string
  ): LookupResult {
    let doesPathExist: boolean = false;
    let childValue: any;

    if (Number.isNaN(Number.parseInt(childName))) {
      // `childName` refers to an object property
      if (Object.hasOwn(objectOrArray, childName)) {
        doesPathExist = true;
        childValue = objectOrArray[childName];
      }
    } else {
      // `childName` refers to an array index
      if (Number.parseInt(childName) < objectOrArray.length) {
        doesPathExist = true;
        childValue = objectOrArray[childName];
      }
    }

    return { doesPathExist, value: childValue };
  }

  private cache = new Map<string, any>();
  private rootObject: any;

  private get(path: string[]) {
    return this.cache.get(path.join("."));
  }

  private has(path: string[]) {
    return this.cache.has(path.join("."));
  }

  constructor() {}

  public initialize(rootObject: any) {
    this.rootObject = rootObject;
    this.cache.set("", rootObject);
  }

  public reset() {
    this.cache.clear();
    this.cache.set("", this.rootObject);
  }

  public set(path: string[], value: any) {
    this.cache.set(path.join("."), value);
  }

  public lookup(path: string[]): LookupResult {
    if (this.has(path)) {
      return { doesPathExist: true, value: this.get(path) };
    }

    // Recursively find the closest ancestor path that has already been cached and start looking up
    // the path from there, caching intermediate elements along the way
    const lookupPath = (path: string[]): LookupResult => {
      const parentPath = path.slice(0, -1);
      const childName = path[path.length - 1];
      if (!this.has(parentPath) && parentPath.length > 0) {
        if (!lookupPath(parentPath).doesPathExist) {
          return { doesPathExist: false };
        }
      }

      const parentValue = this.get(parentPath);
      if (!isObjectOrArray(parentValue)) {
        return { doesPathExist: false };
      }

      const lookupResult = ParameterObjectPathCache.lookupChild(parentValue, childName);
      if (lookupResult.doesPathExist) {
        this.set(path, lookupResult.value);
      }
      return lookupResult;
    };

    return lookupPath(path);
  }
}
