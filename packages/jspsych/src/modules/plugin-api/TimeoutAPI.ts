export class TimeoutAPI {
  private timeout_handlers = [];

  setTimeout(callback, delay) {
    var handle = window.setTimeout(callback, delay);
    this.timeout_handlers.push(handle);
    return handle;
  }

  clearAllTimeouts() {
    for (var i = 0; i < this.timeout_handlers.length; i++) {
      clearTimeout(this.timeout_handlers[i]);
    }
    this.timeout_handlers = [];
  }
}
