# Browser and Device Support

## Desktop and Laptop Browsers

**Supported**

jsPsych supports recent versions of the four most commonly-used web browsers:

 * Chrome
 * Firefox
 * Safari
 * Edge

This means that jsPsych _should_ work on these browsers. If something doesn't work as you expect on one of the browsers above, it might be a bug that should be fixed. You can search for and report bugs on the [jsPsych GitHub Issues page](https://github.com/jspsych/jsPsych/issues). We're very grateful for anyone who takes the time to report bugs - it helps improve the library for everyone!

**Unsupported**

There are many other web browsers that are available, but that are not commonly used. The most well-known of these are Internet Explorer and Opera. jsPsych is not tested on these and other browsers not listed in the Supported section above. jsPsych experiments _might_ work in these browsers, but they _might not_. If you want to give participants the option to use unsupported browsers, then we recommend carefully testing your experiment to make sure that everything works as expected. Otherwise, we suggest asking your participants to only use a supported browser, or incorporating browser, device, and/or feature checks at the start of your experiment. jsPsych offers built-in methods for [exclusion based on minimum browser size and WebAudio API compatibility](exclude-browser.md). You can incorporate other browser/device/feature checks into your experiment by adding custom JavaScript code.

## Mobile Devices

In general, jsPsych experiments can be run on mobile devices (smartphones and tablets). However, certain plugins will not work on mobile. For instance, any plugin that requires a keyboard response without a text input box, such as the *-keyboard-response plugins, will not work. Even plugins that do work on mobile might work differently than they do on desktop and laptop computers. For instance, on mobile devices, a text input box will cause an on-screen keyboard to pop up, which affects the visible content on the screen.

If you plan to run an experiment that allows people to use mobile devices, we recommend doing some extra testing to make sure that everything works as expected. In particular, you may want to check that:
* Font sizes are readable on smaller screens
* Stimuli sizes are large enough and appropriate for the task
* Page is laid out as intended (e.g. elements are centered and do not overlap)
* Response options are touchscreen-friendly (e.g. buttons rather than key presses)
* Response options (e.g. buttons, text boxes, radio buttons) are large enough and far enough apart to be easily selected with a finger tap

It's possible to use your browser's developer tools to emulate mobile devices ([this page shows how to do it in Chrome](https://developers.google.com/web/tools/chrome-devtools/device-mode)), which is useful for getting a sense of how your experiment will look on mobile devices. Just be aware that there are limitations to emulator tools, and there are some aspects of mobile devices/browsers that a desktop browser will not be able to simulate.

## Mobile Browsers

The browser options for mobile phones and tablets are slightly different than those for desktop and laptop computers. In addition to mobile versions of Chrome, Firefox, Safari, and Edge, other notable mobile browsers include Opera Mobile, Samsung Internet, UC Browser, and Dolphin. Because of the greater diversity of mobile browsers and volatility in their usage statistics, jsPsych does not officially support any particular set of mobile browsers. However, we do anticipate that most experiments should work in most mobile browsers, especially the mobile versions of browsers that we do support in Desktop mode. If you run into a problem using jsPsych in mobile browsers, please report it on the [jsPsych GitHub Issues page](https://github.com/jspsych/jsPsych/issues)! We do our best to fix browser incompatibilities that are not specific to a single experiment.
