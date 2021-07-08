# jspsych-informed-consent

This plugin consists of three components which together make up a request for active informed consent:

1. **The Information Letter**  
Participants must be informed prior to providing consent. You can add an inforamtion letter as PDF or HTML. The information letter can be accessed from your experiment files (i.e., locally) or display an actual website (e.g., a standardized letter from your research institute).

1. **The Consent Statements**  
Participants must agree to a number of statements when providing consent. For example, you may wish participants to indicate that they have "... read and understood the information letter". *Note* to add emphasis to the consent statements these were added separetly from the information letter. However, if your consent statements are included in your information letter these can be left empty (see examples).

1. **The Buttons**  
By default we are showing the participants three buttons:  

    * *Decline & Exit*: participants exit the experiment because they did not provide active consent.
    * *Print*: allows participants to download the information letter for future reference (button can be disabled).
    * *Accept & Continue*: participants provide active consent and the experiment continues as expected.

    The text labels of each of these buttons can be customized to your liking.

## Parameters
In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Other parameters can be left unspecified if the default value is acceptable.

Parameter | Type | Default Value | Description
----------|------|---------------|------------
url | string | *undefined* | The path to where your information is located. It will display both PDF and HTML files which are included as experiment files (e.g., locally) or from an external website.
download_information_letter | boolean | true | Whether or not you want participants to see a print/download button. This parameter can only take `true` or `false` values.
button_label_download | string | "Print" | The label you want to show on the print/download button. Clicking this button will prompt a download of the information letter.
button_label_next | string | "Accept & Continue" | The label you want to show on the continue button. Clicking this button will allow participants to continue with the rest of the experiment.
button_label_decline | string | "Decline & Exit" | The label you want to show on the exit button. Clicking this button will stop the experiment.
consent_header | HTML_string | "By accepting and continuing I agree that: " | A header / summary statement indicating that the consent statements listed below are what the participants agree too.
consent_statements | array of strings | ["I have read and understood the information letter;", <br> "I agree to participate in this study;", <br> "I agree with the use of the data that are collected;",] | An array of statemetns to which you want participants to agree. *Note* styling restrictions will only allow you to display a limited number of statements.

## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects the following data for each trial.

Name | Type | Value
-----|------|------
consent_downloaded | boolean | A true or false value indicating whether the participant opted to download the information letter
consent_declined | boolean | A `true` or `false` value indicating whether the participant provided consent (`consent_declined == false`) or declined consent (`consent_declined == true`). 

## Examples