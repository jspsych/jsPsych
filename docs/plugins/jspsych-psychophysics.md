# jspsych-psychophysics

This plugin is developed and maintained by Daiichiro Kuroki for the purpose of conducting online/Web-based psychophysical experiments. I would appreciate it if you could cite [Kuroki (2020)](https://rdcu.be/b5Nie) as well as [de Leeuw (2015)](https://link.springer.com/article/10.3758/s13428-014-0458-y) when you report your research using this plugin.

## What you can do with the jspsych-psychophysics plugin

- You can present multiple stimuli asynchronously, that is, [you can set stimulus onset asynchronies (SOAs) in a trial](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/twoImagesWithSOA.html).
- You can present visual stimuli (e.g., [gabor patches](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/draw-gabor-patches.html), [images](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/randomizedImages.html), [lines](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/lines.html), [rectangles](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/rectangles.html), [circles](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/movingCircles.html), and [texts](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/texts.html)) at intended coordinates, and the time duration can be specified in terms of milliseconds and frames. You can also present moving objects and [play sound files](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/twoSoundsWithSOA.html).
- This plugin presents visual stimuli synchronized with the refresh of the display using the **requestAnimationFrame** method. According to my observation, the SOA between visual stimuli with the plugin was more accurate than that without the plugin ([Kuroki, 2020](https://rdcu.be/b5Nie)).
- You can specify the mouse/keyboard event handler. For example, [you can make a program in which a participant change the luminance of a stimulus pressing the ArrowUp/ArrowDown key, and finish the trial pressing the space key.](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/keyboard_event.html)
- Participants' responses can be captured using the keyboard, mouse or buttons. The position of the mouse click can also be recorded as a response.
- [You can apply masking/filtering to image files](https://www.hes.kyushu-u.ac.jp/~kurokid/jspsychophysics/demos/mask_filter.html).

## How to use the jspsych-psychophysics plugin

It is too complicated to explain in this page, so please refer to the [jspsych-psychphysics web site](https://jspsychophysics.hes.kyushu-u.ac.jp/).

