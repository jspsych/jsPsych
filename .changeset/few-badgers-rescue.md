---
"jspsych": patch
---

Fixed how simulation mode handles `setTimeout` calls to ensure that timeouts are cleared at the end of a trial, even in cases where the user interacts with a simulated trial when the simulation is being run in `visual` mode.
