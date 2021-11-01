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

  getValidKey(choices: "NO_KEYS" | "ALL_KEYS" | Array<string>) {
    const possible_keys = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      " ",
    ];

    let key;
    if (choices == "NO_KEYS") {
      key = null;
    } else if (choices == "ALL_KEYS") {
      key = possible_keys[Math.floor(Math.random() * possible_keys.length)];
    } else {
      key = choices[Math.floor(Math.random() * choices.length)];
    }

    return key;
  }
}
