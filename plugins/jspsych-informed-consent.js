// AUTHOR:
// Sally A.M. Hogenboom (https://github.com/SHogenboom)

// DATE:
// July, 2021

// ADAPTED FROM
// jspsych-plugin-template.js (how to structure plugins)
// jspsych docs-demos (under construction; including iframes)
// jspsych-instructions.js (displaying multiple-pages with buttons)
// https://stackoverflow.com/questions/33270525/expanding-iframe-within-flexbox ("full-page" iframes)

// DESCRIPTION
// The purpose of this document is to request active informed consent from participants.
// They will first be presented with a information letter (as external html)
// ... which they may also download for future reference.
// They will then be presented with the consent questions (as external html / html form)
// ... if consent is not provided the experiment will stop.

// Initialize plugin
jsPsych.plugins["informed-consent"] = (function () {
  // Initialize
  var plugin = {};

  // The information that may be passed into the plugin
  // ... when called from a trial
  plugin.info = {
    // Name of the plugin - should be same as defined at the top.
    name: "informed-consent",
    parameters: {
      // EXTERNAL WEBPAGE
      url: {
        description: "A link to the external HTML page you wish to display.",
        pretty_name: "URL",
        type: jsPsych.plugins.parameterType.STRING,
        default: undefined,
      },
      // BUTTONS
      download_information_letter: {
        description:
          "Do you want to present participants the option of downloading the information letter? [TRUE/FALSE]",
        pretty_name: "Download Information Letter",
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
      },
      button_label_download: {
        description: "The text you want to display on the download button",
        pretty_name: "Button Label Download",
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: "Print",
      },
      button_label_next: {
        description: "The text you want to display on the continue button",
        pretty_name: "Button Label Continue",
        type: jsPsych.plugins.parameterType.STRING,
        default: "Accept & Continue",
      },
      button_label_decline: {
        description: "The text you want to display on the decline button",
        pretty_name: "Button Label Decline",
        type: jsPsych.plugins.parameterType.STRING,
        default: "Decline & Exit",
      },
      // CONSENT STATEMENTS
      consent_header: {
        description:
          "A short and concisce description you want to show above the consent statement",
        pretty_name: "Consent Header",
        type: jsPsych.plugins.parameterType.HTML_STRING,
        default: "By accepting and continuing I agree that: ",
      },
      consent_statements: {
        description:
          "An array of statements to which you want the participants to provide active consent",
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: "Consent Statements",
        array: true,
        default: [
          "I have read and understood the information letter;",
          "I agree to participate in this study;",
          "I agree with the use of the data that are collected;",
        ],
      },
    }, // END parameters
  }; // END plugin.info

  // What actually happens in the trial (actions, visualizations etc)
  // `display_element` is the name of the HTML object that can be modified. Basicly covers the
  // ... entire screen.
  // `trial` is the information about the trial, as specified in plugin.info.
  plugin.trial = function (display_element, trial) {
    // PARAMETERS
    var container_margin = "1em";
    var container_width = "80vw"; // 80% of available view width
    var container_border = "1px solid #aaa"; // light-grey
    var button_margin = "1em";
    var consent_status = [];
    var start_time = performance.now();

    // CREATE IFRAME CONTAINER
    // Create a div element that holds the iframe (external html)
    // Apply custom styling to the element so that it takes up about 2/3s of
    // ... the available vertical space.
    iframe_container = document.createElement("div");
    // Add a custom id so that we can refer to it later
    iframe_container.id = "jspsych-content-iframe-container";
    // Set styling
    iframe_container.style.display = "flex";
    iframe_container.style.flexDirection = "column";
    iframe_container.style.width = container_width;
    iframe_container.style.height = "60vh"; // 60% of available view height
    iframe_container.style.border = container_border;
    iframe_container.style.margin = container_margin;

    // ADD IFRAME
    iframe = document.createElement("iframe");
    // Add a custom id so that we can refer to it later
    iframe.id = "jspsych-content-iframe";
    iframe.src = trial.url;
    iframe.title = "Information Letter";
    // Set styling
    iframe.style.flex = "1 1 auto";
    // Add iframe to the container
    iframe_container.appendChild(iframe);
    // Add the entire container element to the HTML
    display_element.appendChild(iframe_container);

    // CREATE CONSENT CONTAINER
    // Create a div element that holds the buttons that allow
    // ... participants to abort, download, and/or continue
    consent_container = document.createElement("div");
    // Add a custom id so that we can refer to it later
    consent_container.id = "jspsych-content-consent-container";
    // Set styling
    consent_container.style.width = container_width;
    consent_container.style.height = "20vh"; // 20% of available view height
    consent_container.style.margin = container_margin;
    consent_container.style.textAlign = "left";
    consent_container.innerHTML = trial.consent_header;
    // Initilize list
    consent_statements = document.createElement("ul");

    // ADD CONSENT STATEMENTS
    for (i = 0; i < trial.consent_statements.length; i++) {
      statement = document.createElement("li");
      statement.id = "jspsych-consent-statement-" + i;
      statement.innerHTML = trial.consent_statements[i];
      // add to list
      consent_statements.appendChild(statement);
    }
    // Add list to container
    consent_container.appendChild(consent_statements);
    // Add the entire container element to the HTML
    display_element.appendChild(consent_container);

    // CREATE BUTTON CONTAINER
    // Create a div element that holds the buttons that allow
    // ... participants to abort, download, and/or continue
    button_container = document.createElement("div");
    // Add a custom id so that we can refer to it later
    button_container.id = "jspsych-content-button-container";
    // Set styling
    button_container.style.width = container_width;
    button_container.style.height = "25vh"; // 25% of available view height
    // button_container.style.border = container_border;
    button_container.style.margin = container_margin;

    // ADD BUTTONS
    // Decline button
    decline_button = document.createElement("button");
    decline_button.id = "jspsych-button-decline";
    decline_button.className = "jspsych-btn"; // included in jspsych.css styling
    // Add content
    decline_button.innerHTML = trial.button_label_decline;
    // Add styling
    decline_button.style.marginRight = button_margin;
    // Add responsivity
    decline_button.onclick = function () {
      // Log consent
      consent_status.push(trial.button_label_decline);
      endTrial();
    };
    // Add to container
    button_container.appendChild(decline_button);

    // Download button for the information letter
    // Defaults to TRUE
    if (trial.download_information_letter) {
      download_button = document.createElement("button");
      download_button.id = "jspsych-button-download";
      download_button.className = "jspsych-btn"; // included in jspsych.css styling
      // Add content
      download_button.innerHTML = trial.button_label_download;
      // Add styling
      download_button.style.marginRight = button_margin;
      // Add responsivity
      download_button.onclick = function () {
        // Log consent
        consent_status.push(trial.button_label_download);
        // Open external html in seperate window
        window.open(trial.url, "_blank");
      };
      // Add to container
      button_container.appendChild(download_button);
    }

    // continue button
    next_button = document.createElement("button");
    next_button.id = "jspsych-button-next";
    next_button.className = "jspsych-btn"; // included in jspsych.css styling
    // Add content
    next_button.innerHTML = trial.button_label_next;
    // Add styling
    next_button.style.marginRight = button_margin;
    // Add responsivity
    next_button.onclick = function () {
      // Log consent
      consent_status.push(trial.button_label_next);

      endTrial();
    };
    // Add to container
    button_container.appendChild(next_button);

    // Add the container element to the HTML
    display_element.appendChild(button_container);

    var endTrial = function () {
      // Clean all content from the screen for next trial
      display_element.innerHTML = "";

      // Save trial data
      var trial_data = {
        rt: performance.now() - start_time,
        consent_downloaded: consent_status.includes(
          trial.button_label_download
        ),
        consent_declined: consent_status.includes(trial.button_label_decline),
      };

      // Save data and finish trial
      jsPsych.finishTrial(trial_data);
    };
  }; // END plugin.trial

  return plugin;
})(); // END FUNCTION
