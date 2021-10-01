---
"@jspsych/plugin-visual-search-circle": major
---

Added new `stimuli` parameter and changed `foil` parameter to only allow a string (not array). The visual circle stimuli set can now be defined in two ways. One option is to use the `set_size`, `target` (image string), and `foil` (image string) parameters, in which case the `foil` image will be repeated up to `set_size` (if target is not present) or `set_size` - 1 (if target is present). The other option is to specify the `stimuli` parameter, which is an arbitrary array of images and therefore allows for different foil/distractor images. 

pr: 2133
