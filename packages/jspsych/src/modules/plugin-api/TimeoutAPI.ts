export class TimeoutAPI {
  private timeout_handlers = [];

  setTimeout(callback, delay) {
    const handle = window.setTimeout(callback, delay);
    this.timeout_handlers.push(handle);
    return handle;
  }

  clearAllTimeouts() {
    for (const handler of this.timeout_handlers) {
      clearTimeout(handler);
    }
    this.timeout_handlers = [];
  }
}
