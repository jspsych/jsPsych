export class HardwareAPI {
  /**
   * Indicates whether this instance of jspsych has opened a hardware connection through our browser
   * extension
   **/
  hardwareConnected = false;

  constructor() {
    //it might be useful to open up a line of communication from the extension back to this page
    //script, again, this will have to pass through DOM events. For now speed is of no concern so I
    //will use jQuery
    document.addEventListener("jspsych-activate", (evt) => {
      this.hardwareConnected = true;
    });
  }

  /**
   * Allows communication with user hardware through our custom Google Chrome extension + native C++ program
   * @param		mess	The message to be passed to our extension, see its documentation for the expected members of this object.
   * @author	Daniel Rivas
   *
   */
  hardware(mess) {
    //since Chrome extension content-scripts do not share the javascript environment with the page
    //script that loaded jspsych, we will need to use hacky methods like communicating through DOM
    //events.
    const jspsychEvt = new CustomEvent("jspsych", { detail: mess });
    document.dispatchEvent(jspsychEvt);
    //And voila! it will be the job of the content script injected by the extension to listen for
    //the event and do the appropriate actions.
  }
}
