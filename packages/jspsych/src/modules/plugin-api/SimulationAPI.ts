export class SimulationAPI {
  dispatchEvent(event: Event) {
    document.body.dispatchEvent(event);
  }

  keyDown(key: string) {
    this.dispatchEvent(new KeyboardEvent("keydown", { key }));
  }

  keyUp(key: string) {
    this.dispatchEvent(new KeyboardEvent("keyup", { key }));
  }

  pressKey(key: string) {
    this.keyDown(key);
    this.keyUp(key);
  }

  clickTarget(target: Element) {
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
}
