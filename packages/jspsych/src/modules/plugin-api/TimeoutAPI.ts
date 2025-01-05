/**
 * A class that provides a wrapper around the global setTimeout and clearTimeout functions.
 */
export class TimeoutAPI {
  private timeout_handlers: number[] = [];

  /**
   * Calls a function after a specified delay, in milliseconds.
   * @param callback The function to call after the delay.
   * @param delay The number of milliseconds to wait before calling the function.
   * @returns A handle that can be used to clear the timeout with clearTimeout.
   */
  setTimeout(callback: () => void, delay: number): number {
    const handle = window.setTimeout(callback, delay);
    this.timeout_handlers.push(handle);
    return handle;
  }

  /**
   * Clears all timeouts that have been created with setTimeout.
   */
  clearAllTimeouts(): void {
    for (const handler of this.timeout_handlers) {
      clearTimeout(handler);
    }
    this.timeout_handlers = [];
  }
}
