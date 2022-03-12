---
"jspsych": patch
---

Fixed an issue where the `post_trial_gap` was still run in realtime during `data-only` simulation mode. The gap is now skipped as intended.
