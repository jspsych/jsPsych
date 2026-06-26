'use strict';

class JatosAdapter {
  constructor() {
    /**
     * Local fan-out list. jatos.onGroupSession accepts only a single callback,
     * so the adapter registers one dispatcher and routes it to all subscribers.
     */
    this.subscribers = /* @__PURE__ */ new Set();
    if (typeof jatos === "undefined") {
      throw new Error(
        "JatosAdapter: the jatos global is not defined. Ensure jatos.js is loaded before creating a JatosAdapter. This adapter only works when the experiment is running inside JATOS."
      );
    }
    this.participantId = String(jatos.workerId);
  }
  connect() {
    return new Promise((resolve, reject) => {
      jatos.joinGroup({
        onOpen: () => {
          resolve();
        },
        onGroupSession: () => {
          const data = this.getAll();
          for (const cb of this.subscribers) {
            cb(data);
          }
        },
        onError: (errMsg) => {
          reject(new Error(`JatosAdapter: failed to join group \u2014 ${errMsg ?? "unknown error"}`));
        }
      });
    });
  }
  async push(data) {
    const maxAttempts = 8;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await jatos.groupSession.set(this.participantId, data);
        return;
      } catch {
        if (attempt === maxAttempts - 1) {
          throw new Error(
            "JatosAdapter: push failed after retries (group session version conflict)"
          );
        }
        const delayMs = 50 * Math.pow(2, attempt) + Math.random() * 50;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  getAll() {
    return jatos.groupSession.getAll() ?? {};
  }
  get(participantId) {
    return jatos.groupSession.get(participantId);
  }
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
  disconnect() {
    this.subscribers.clear();
    return Promise.resolve();
  }
}

module.exports = JatosAdapter;
//# sourceMappingURL=index.cjs.map
