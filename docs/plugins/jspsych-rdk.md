# jspsych-rdk plugin

This plugin displays a Random Dot Kinematogram (RDK) and allows the subject to report the primary direction of motion by pressing a key on the keyboard. The stimulus can be displayed until a keyboard response is given or until a certain duration of time has passed. The RDK is fully customizable (see documentation below) and can display multiple apertures at the same time, each with its own parameters.

We would appreciate it if you cited this paper when you use the RDK: 
<b>Rajananda, S., Lau, H. & Odegaard, B., (2018). A Random-Dot Kinematogram for Web-Based Vision Research. Journal of Open Research Software. 6(1), p.6. DOI: [http://doi.org/10.5334/jors.194]</b>

For optimal performance, fullscreen mode should be manually triggered by the user (e.g. F11 key in Chrome for Windows). Usage of the default Fullscreen trigger from the jsPsych API library with this plugin might result in the stimuli being displayed incorrectly.

## Parameters

In addition to the [parameters available in all plugins](/overview/plugins#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of *undefined* must be specified. Parameters can be left unspecified if the default value is acceptable.

| Parameter                | Type             | Default Value        | Descripton                               |
| ------------------------ | ---------------- | -------------------- | ---------------------------------------- |
| choices                  | array of strings | jsPsych.ALL_KEYS     | The valid keys that the subject can press as a response. Must be an array of strings. If left unspecified, any key is a valid key. |
| correct_choice           | array or string  | *undefined*          | The keys that are considered the correct response for that particular trial. Can be a single string or an array of strings. This needs to be linked with the `coherent_direction` parameter (see Examples section below for an illustration). This is used to determine whether the subject chose the correct response. The boolean indicating whether or not the subject chose the correct response is returned in the `correct` key of the data object. |
| trial_duration           | numeric          | 500                  | The amount of time that the stimulus is displayed on the screen in ms. If -1, the stimulus will be displayed until the subject keys in a valid response. (`choices` parameter must contain valid keys or else the stimuli will run indefinitely). |
| response_ends_trial      | boolean          | true                 | If `true`, then the subject's response will end the trial. If `false`, the stimuli will be presented for the full `trial_duration` (the response will be recorded as long as the subject responds within the trial duration). |
| number_of_apertures      | numeric          | 1                    | The number of apertures or RDKs on the screen. If set to more than one, remember to set the location (i.e., aperture_center_x and aperture_center_y) parameters to separate them. <br>In addition, each aperture can be customized individually by passing in an array of values as the parameter (see example below). If a single value (not an array) is passed as the parameter, then all apertures will have the same parameter. |
| number_of_dots           | numeric          | 300                  | Number of dots per set. Equivalent to number of dots per frame. |
| number_of_sets           | numeric          | 1                    | Number of sets to cycle through. Each frame displays one set of dots. (E.g. If 2 sets of dots, frame 1 will display dots from set 1, frame 2 will display dots from set 2, frame 3 will display sets from set 1, etc.) |
| coherent_direction       | numeric          | 0                    | The direction of movement for coherent dots in degrees. 0 degrees is in the 3 o'clock direction, and increasing this number moves counterclockwise. (E.g. 12 o'clock is 90, 9 o'clock is 180, etc.) Range is 0 - 360. |
| coherence                | numeric          | 0.5                  | The proportion of dots that move together in the coherent direction. Range is 0 to 1. |
| opposite_coherence       | numeric          | 0                    | The proportion of moving in the direction opposite of the coherent direction. Range is 0 to (1-coherence). |
| dot_radius               | numeric          | 2                    | The radius of each individual dot in pixels. |
| dot_life                 | numeric          | -1                   | The number of frames that pass before a dot disappears and reappears in a new frame. -1 denotes that the dot life is infinite (i.e., a dot will only disappear and reappear if it moves out of the aperture). |
| move_distance            | numeric          | 1                    | The number of pixel lengths the dot will move in each frame (analogous to speed of dots). |
| aperture_width           | numeric          | 600                  | The width of the aperture in pixels. For a square aperture, this will determine both the width and height. For circular aperture, this will determine the diameter. |
| aperture_height          | numeric          | 400                  | The height of the aperture in pixels. For square and circle apertures, this will be ignored. |
| dot_color                | string           | "white"              | The color of the dots.                   |
| background_color         | string           | "gray"               | The color of the background.             |
| RDK_type                 | numeric          | 3                    | The Signal Selection Rule (Same/Different) and Noise Type (Random Position/Walk/Direction):<br><br>1 - Same && Random Position<br>2 - Same && Random Walk<br>3 - Same && Random Direction<br>4 - Different && Random Position<br>5 - Different && Random Walk<br>6 - Different && Random Direction<br><br>(See 'RDK parameter' below for more detailed information)<br> |
| aperture_type            | numeric          | 2                    | The shape of the aperture.<br><br>1 - Circle<br>2 - Ellipse<br>3 - Square<br>4 - Rectangle<br> |
| reinsert_type            | numeric          | 2                    | The type of reinsertion of a dot that has gone out of bounds<br><br>1 - Randomly appear anywhere in the aperture<br>2 - Appear on the opposite edge of the aperture. For squares and rectangles, a random point on the opposite edge is chosen as the reinsertion point. For circles and ellipses, the exit point is reflected about center to become the reinsertion point.<br> |
| aperture_center_x        | numeric          | window.innerWidth/2  | The x-coordinate of the center of the aperture, in pixels.<br> |
| aperture_center_y        | numeric          | window.innerHeight/2 | The y-coordinate of the center of the aperture, in pixels.<br> |
| fixation_cross           | boolean          | false                | Whether or not a fixation cross is presented in the middle of the screen.<br> |
| fixation_cross_width     | numeric          | 20                   | The width of the fixation cross in pixels.<br> |
| fixation_cross_height    | numeric          | 20                   | The height of the fixation cross in pixels.<br> |
| fixation_cross_color     | string           | "black"              | The color of the fixation cross.<br>     |
| fixation_cross_thickness | numeric          | 1                    | The thickness of the fixation cross in pixels.<br> |
| border                   | boolean          | false                | The presence of a border around the aperture.<br> |
| border_thickness         | numeric          | 1                    | The thickness of the border in pixels.<br> |
| border_color             | string           | "black"              | The color of the border.<br>             |

### RDK type parameter
** See Fig. 1 in Scase, Braddick, and Raymond (1996) for a visual depiction of these different signal selection rules and noise types.

#### Signal Selection rule:
-**Same**: Each dot is designated to be either a coherent dot (signal) or incoherent dot (noise) and will remain so throughout all frames in the display. Coherent dots will always move in the direction of coherent motion in all frames.
-**Different**: Each dot can be either a coherent dot (signal) or incoherent dot (noise) and will be designated randomly (weighted based on the coherence level) at each frame. Only the dots that are designated to be coherent dots will move in the direction of coherent motion, but only in that frame. In the next frame, each dot will be designated randomly again on whether it is a coherent or incoherent dot.

#### Noise Type:
-**Random position**: The incoherent dots appear in a random location in the aperture in each frame.<br/>
-**Random walk**: The incoherent dots will move in a random direction (designated randomly in each frame) in each frame.<br/>
-**Random direction**: Each incoherent dot has its own alternative direction of motion (designated randomly at the beginning of the trial), and moves in that direction in each frame.<br/>


## Data Generated

In addition to the [default data collected by all plugins](/overview/plugins#data-collected-by-all-plugins), this plugin collects all parameter data described above and the following data for each trial.

| Name             | Type        | Value                                    |
| ---------------- | ----------- | ---------------------------------------- |
| rt               | numeric     | The response time in ms for the subject to make a response. |
| response         | string      | The key that the subject pressed.        |
| correct          | boolean     | Whether or not the subject's key press corresponded to those provided in correct_choice. |
| frame_rate       | numeric     | The average frame rate for the trial. 0 denotes that the subject responded before the appearance of the second frame. |
| number_of_frames | numeric     | The number of frames that was shown in this trial. |
| frame_rate_array | array       | The array that holds the number of miliseconds for each frame in this trial. This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()` functions. |
| canvas_width     | numeric     | The width of the canvas in pixels.       |
| canvas_height    | numeric     | The height of the canvas in pixels.      |

## Example

#### Setting the correct_choice parameter by linking it to the coherent_direction parameter:

```javascript
var trial_right = {
	coherent_direction: 0,
	correct_choice: "p"
};

var trial_left = {
	coherent_direction: 180,
	correct_choice: "q"
};
```

#### Displaying a trial with 2 choices and 1 correct choice

```javascript
var test_block = {
	type: "rdk", 
	post_trial_gap: 0,
	number_of_dots: 200,
	RDK_type: 3,
	choices: ["a", "l"],
	correct_choice: "a",
	coherent_direction: 180,
	trial_duration: 1000
};
```

#### Displaying a trial with multiple apertures

```javascript
var test_block = {
    type: "rdk", 
    number_of_apertures: 3, //This needs to be set if more than one aperture
    trial_duration: 10000,
    RDK_type: 3, //Applied to all apertures if only one value
    aperture_width: 200, //Applied to all apertures if only one value
    number_of_dots: [50, 200, 100], //Different parameter for each aperture. Array length must equal number_of_apertures
    aperture_center_x: [(window.innerWidth/2)-300,window.innerWidth/2,(window.innerWidth/2)+300] //Separate the apertures on the screen (window.innerWidth/2 is the middle of the screen)
};
```

