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

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
