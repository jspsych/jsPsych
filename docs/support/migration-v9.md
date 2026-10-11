# Migrating an experiment to v9.x

This guide is aimed at upgrades from version 8.x to 9.x.
If you are using version 7.x or earlier, please follow the [migration guide for v8.x](./migration-v8.md) before trying to upgrade to v9.x.

## Default sizing of buttons and text inputs

`jspsych.css` now renders buttons and text inputs larger by default.

`.jspsych-btn` uses a 16px font with 12px/16px padding, computing to roughly 48px tall. In version 8.x it used a 14px font with 8px/12px padding, computing to roughly 38px. The new size clears the 44px minimum target size recommended by [WCAG 2.5.5](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) and the Apple Human Interface Guidelines, which makes experiments usable on phones and tablets without additional styling.

Text inputs in the display element move from a 14px to a 16px font. Below 16px, iOS Safari zooms the viewport when a field receives focus, leaving the participant on a partial view of the trial.

Both changes apply on all devices, not only touch devices.

!!! warning "Consider this before upgrading mid-study"
    Button size can influence how quickly participants respond. If you are partway through data collection, upgrading will change the motor demands of your task between participants. Finish the study on version 8.x, or restore the previous sizing as shown below.

If you want the version 8.x appearance, add these rules to your own stylesheet, loaded after `jspsych.css`:

```css
.jspsych-btn {
  padding: 8px 12px;
  font-size: 14px;
}

.jspsych-display-element input[type="text"] {
  font-size: 14px;
}
```

Note that reverting the text input size reintroduces the iOS zoom-on-focus behavior described above.
