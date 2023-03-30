---
title: 'jsPsych: Enabling an open-source ecosystem of behavioral experiments'
tags:
  - JavaScript
  - psychology
  - behavioral research
  - experiment design
authors:
  - name: Joshua R. de Leeuw
    orcid: 0000-0003-4815-2364
    corresponding: true
    affiliation: 1
  - name: Rebecca A. Gilbert
    orcid: 0000-0003-4574-7792
    affiliation: "2, 3"
  - name: Björn Luchterhandt
    orcid: 0000-0002-9225-2787
    affiliation: 4
affiliations:
  - name: Vassar College, USA
    index: 1
  - name: MRC Cognition and Brain Sciences Unit, University of Cambridge, UK
    index: 2
  - name: Massachusetts Institute of Technology, USA
    index: 3
  - name: Paderborn University, Germany
    index: 4
date: 30 March 2023
bibliography: paper.bib
---

# Summary

It is common practice to conduct research on human behavior over the internet. Researchers use a variety of methodological approaches to conduct these studies. Some of this research can be done with survey instruments, for which there are many software options. However, much of the research in psychology and human behavior requires more fine-grained measures, and thus requires tasks that rely on precise measurement of stimulus presentation and response timing, randomization, dynamic procedures, and interactive content. jsPsych is a JavaScript library that allows researchers to build a wide range of the types of experiments that historically could only be run in a lab setting, and run them on any device that has a web browser, including desktop/laptop computers and mobile devices. 

jsPsych was initially released in 2012 [@de2015jspsych]. This paper is focused on jsPsych version 7, which contains the most substantial set of changes that have been made to the library since its initial release . The software has been widely rewritten with the goal of supporting integration with modern web development tools and improving the developer experience for researchers who want to make contributions to the library. Our hope is that this will make it easier for researchers to collaboratively develop jsPsych and tools that use jsPsych [e.g., @hartshorne2019thousand; @sochat2016experiment; @luchterhandt2023jspsychbuilder; @provenza2021honeycomb]

Highlights of the changes include:

1. **JavaScript modules.** Refactoring the library to use ES6 modules allows jsPsych developers to take advantage of modern JavaScript development tools like package managers and bundlers. Researchers can now use tools like npm or yarn to integrate jsPsych with their choice of experiment building and hosting environments, and to selectively import jsPsych plugins in their experiment. Researchers can publish their own jsPsych plugins on package repositories and share them with the research community.
2. **TypeScript support.** We converted the codebase to TypeScript to provide better error checking and better integration with autocomplete and documentation tools that can use type information to assist developers.
3. **Simulation mode.** Version 7 introduced support for simulating participant behavior, which can be used to robustly test code, experimental design, and analysis pipelines prior to running an experiment (we describe the application of these features more in @de2022simulating).
4. **Community contributions repository.** We created [a repository](https://github.com/jspsych/jspsych-contrib) to help community members share their plugins and extensions. We provide templates that are compatible with jsPsych versions 6 and 7 and CI/CD tooling to publish submitted packages to npm. 
5. **New plugins and extensions.** We added several new plugins and extensions, including support for recording audio and video responses from participants and mouse tracking.

# Statement of need

jsPsych is one of many software options for building online experiments [e.g., @henninger2021lab; @anwyl2020gorilla; @peirce2022building; @stoet2017psytoolkit; @scott2017lookit; @harrison2020psychtestr; @almaatouq2021empirica; @balietti2017nodegame; @mathot2012opensesame; @zehr2018penncontroller]. jsPsych and these other options vary in ways such as available features, closed vs. open source, primary programming language, and syntax/style choices, but the main distinction is the particular way that jsPsych abstracts the design of an experiment. jsPsych experiments are constructed using plugins — self-contained modules that define an event and its parameters. This mode of abstraction allows developers to create both generic plugins that can be used in many different experiments (e.g., show some HTML on the screen and record a keyboard response) and plugins that implement specific experimental paradigms  (e.g., display a circular visual search array with a specific number of distractors). Once a plugin is created, it is relatively easy for researchers with no previous web development experience to incorporate the plugin into their own experiments.

jsPsych’s plugin architecture lends itself to community-driven development. Researchers can develop plugins that abstract an experiment at a level that makes sense for a particular paradigm and then these plugins can be shared with other researchers who want to construct similar experiments. Over the past several years, there have been a handful of researchers who have published articles describing new jsPsych plugins [@kuroki2022jsquestplus; @kuroki2021new; @rajananda2018random; @donhauser2022audio; @gibeau2021corsi; @kinley2022jspsych; @strittmatter2022random]. As more users of jsPsych feel comfortable with developing their own plugins and publishing them in easily-accessible repositories, the development work that any individual researcher will need to do to create an experiment will decrease. We hope this will enable a robust ecosystem of open-source behavioral experiments.

# Acknowledgements

jsPsych development from 2020-2022 was partially funded by a grant from the Mozilla Foundation. We would like to thank everyone in the jsPsych community who has helped improve this project through code contributions, feature suggestions, bug reports, documentation, and supporting other users on the discussion forum.

# References