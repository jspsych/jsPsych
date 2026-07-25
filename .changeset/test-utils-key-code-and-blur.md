---
"@jspsych/test-utils": minor
---

The `keyDown()` and `keyUp()` helpers accept an optional second argument that sets the `code` property (the physical key) on the dispatched `KeyboardEvent`, in addition to the existing `key` argument. A new `windowBlur()` helper dispatches a `blur` event on `window` and flushes pending promises, for testing behavior that depends on the page losing focus.
