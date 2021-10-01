# Timing accuracy

Wondering if jsPsych can be used for research that depends on accurate display times or response time measurement? For most purposes, the answer is yes. 

**Display timing** is somewhat less accurate in JavaScript than in standard experimental software that runs on a desktop. Desktop software can have closer integration with the graphics devices of the machine than JavaScript currently permits. If a one or two frame (17-33ms) difference in display timing matters for your experiment, then you'll want to be careful with JavaScript-based experiments. It is possible to achieve this level of control in JavaScript, but it often requires code that is more tailored to your experiment and some restrictions about which browsers can be used to run the experiment.

!!! tip 
    If you are hoping to run an experiment with the best timing that jsPsych can offer, we currently recommend using the [jspsych-psychophysics plugin](https://jspsychophysics.hes.kyushu-u.ac.jp/) developed by [Daiichiro Kuroki](https://twitter.com/kurokida1). 

    Kuroki, D. (2021). A new jsPsych plugin for psychophysics, providing accurate display duration and stimulus onset asynchrony. *Behavior Research Methods*, *53*, 301–310. [https://doi.org/10.3758/s13428-020-01445-w](https://doi.org/10.3758/s13428-020-01445-w)

**Response time** measurements in jsPsych (and JavaScript in general) are comparable to those taken in standard lab software like Psychophysics Toolbox and E-Prime. Response times measured in JavaScript tend to be a little bit longer (10-40ms), but have similar variance.

## References

See the following papers for extensive work on display and response timing in browser-based experiments.

Note that browsers are updating frequently and the JavaScript language specification is also changing. It's possible that the results from these papers do not apply to current versions of web browsers. 

Future updates to JavaScript APIs will likely improve the ability of online experiments to provide more accurate display timing and response time measurement.

* [Bridges, D., Pitiot, A., MacAskill, M. R., & Peirce, J. W. (2020). The timing mega-study: Comparing a range of experiment generators, both lab-based and online. *PeerJ, 8*, e9414.](https://peerj.com/articles/9414/)
* [Anwyl-Irvine, A., Dalmaijer, E. S., Hodges, N., & Evershed, J. K. (2020). Realistic precision and accuracy of online experiment platforms, web browsers, and devices. *Behavior Research Methods, 53,* 1-19.](https://link.springer.com/article/10.3758/s13428-020-01501-5)
* [Pronk, T., Wiers, R. W., Molenkamp, B., & Murre, J. (2020). Mental chronometry in the pocket? Timing accuracy of web applications on touchscreen and keyboard devices. *Behavior Research Methods, 52*(3), 1371-1382.](https://link.springer.com/article/10.3758/s13428-019-01321-2)
* [Pinet, S., Zielinski, C., Mathôt, S. et al. (2017). Measuring sequences of keystrokes with jsPsych: Reliability of response times and interkeystroke intervals.  *Behavior Research Methods*, *49*(3), 1177-1178.](http://link.springer.com/article/10.3758/s13428-016-0776-3)
* [de Leeuw, J. R., & Motz, B. A. (2016). Psychophysics in a Web browser? Comparing response times collected with JavaScript and Psychophysics Toolbox in a visual search task. *Behavior Research Methods*, *48*(1), 1-12.](http://link.springer.com/article/10.3758%2Fs13428-015-0567-2)
* [Hilbig, B. E. (2016). Reaction time effects in lab- versus web-based research: Experimental evidence. *Behavior Research Methods*, *48*(4), 1718-1724.](http://dx.doi.org/10.3758/s13428-015-0678-9)
* [Reimers, S., & Stewart, N. (2015). Presentation and response time accuracy in Adobe Flash and HTML5/JavaScript Web experiments. *Behavior Research Methods*, *47*(2), 309-327.](http://link.springer.com/article/10.3758%2Fs13428-014-0471-1)

