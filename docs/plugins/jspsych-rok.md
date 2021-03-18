# jspsych-rok plugin

This plugin displays oriented objects (oobs) that move and allows the subject to report the primary direction of motion or the primary orientation by pressing a key on the keyboard. 
The stimulus can be displayed until a keyboard response is given or until a certain duration of time has passed. Oobs are objects that have an orientation (e.g. triangles).

We would appreciate it if you cited this paper when you use the plugin: 


## Parameters

Parameters can be left unspecified if the default value is acceptable. If more then one aperture is displayed most of the parameters should be specified as array (specified by the array column).
The elements of the array then apply to the corresponding aperture. Features that are not fully implemented yet are marked with an x

|Parameter|Type|Default Value| Descripton|Array|
|---------|----|-------------|-----------|-----|
choices|array|[]|The valid keys that the subject can press to indicate a response|must|
correct_choice|string|undefined|The correct keys for that trial|can|
number_of_apertures|INT|1|Number of apertures. If greater then one, other parameters of trial should be arrays|can|
aperture_width|INT|600|The width of the aperture in pixels|can|
aperture_height|INT|400|he height of the aperture in pixels|can|
aperture_position_left|INT|50|Position of midpoint of aperture in x direction in percentage of window width (50 being middle)|can|
aperture_position_top|INT|50|Position of midpoint of aperture in y direction in percentage of window width (0 being top, 50 being middle, 100 being bottom)|can
aperture_shape|INT|0|0 - rectangular, 1 - elliptic|can|
trial_duration|int|0|The length of stimulus presentation. Zero for endless loop|no|
response_ends_trial|bool|true|If true, then any valid key will end the trial|no|
number_of_oobs|int|300|The number of oriented objects per set in the stimulus|can|
oob_size|INT|2|The size of the orientated objects in percentage of aperture_width|can|
oob_color|STRING,|white|The color of the oobs|can|
stimulus_type|INT|0|Appearance of stimulus (0-triangles, 1-circle,2-square,3-bird, 4-image)|can|
stimulus_image|IMAGE|null|Pictures of stimuli, can be key-framed(animated) or randomised, see documentation|can|
stimulus_image_keyframes|INT|1|Number of keyframes in stimulus images|can|
stimulus_keyframe_time|FLOAT|.1|Time between keyframes in seconds|can|
stimulus_mirror|INT|0|Mirror image instead of rotating (1 - x axis, 2 - y axis) Can be useful for oobs that have two orientation axis (e.g front to back and up and down)|can|
coherent_movement_direction|INT|0|The direction of coherent motion in degrees (0 degree meaning right)|can|
coherent_orientation|INT|0|The orientation of the objects in degree (0 degree meaning right)|can|
coherence_movement|INT|50|The percentage of oriented objects moving in the coherent direction|can|
coherence_orientation|INT|50|The percentage of objects that are oriented in the coherent orientation|can|
coherence_movement_opposite|INT|0|The percentage of oriented objects moving in the direction opposite of the coherent direction|can|
coherence_orientation_opposite|INT|0|The percentage of objects that are oriented opposite of the coherent orientation|can|
movement_speed|INT|10|The movement speed of the oobs in (percentage of aperature_width)/second|can|
movement_speed_randomisation|INT|0|The percentage of randomisation in movement speed (0 meaning all orientated objects move with speed defined in movement_speed, 100 meaning movement speeds from 0 to 2x movement_speed)|can|
random_movement_type|INT|0|ype of random movement (0 direction is random but fixed, 1 movement direction of incoherent oobs changes over time|can|
random_orientation_type|INT|0|Type of random movement (0 - orientation is random but fixed, 1 - orientation of incoherent oobs changes over time|can|
background_color|STRING|gray|The background of the stimulus|can|
background_image|IMAGE|null|Background image, can be|can|
prompt|STRING|null|Prompt that is presented above the stimulus|can|
fade_out|INT|0|Fade the oobs on the edges of the aperture|can|
experiment_congruency_mode|INT|0|Sets experiment to congruency mode: experiment_main_task has to be  set (0 = movement or 1 = direction) if this is set to 1 or 2. The congruency of the task does only apply to coherent oobs of main task. If this is set to 1 the remaining oobs secondary feature (the non task feature) is set at random. If this is set to 2 the remaining oobs have the same direction and orientation|no|
experiment_main_task|INT|0|Sets the main task when experiment is in congruency mode. The congruency of the other task then only applies to non random oobs of main task(0 - movement task, 1 - orientation task)|can|
units|STRING|null|Units in which size and speed of oobs is expressed (null - percentage of aperture width, px - pixels|no|


### Image Loading
If image are keyframed, the keyframes must be loaded as one picture in a framesheet. Keyframes are next to each other. If the image should be mirrored a mirrored version of the image must be in the same sheet below the original keyframe.


## Data Generated

In addition to the default data collected by all plugins, this plugin collects all parameter data described above and the following data for each trial.


|Name|Type|Value|
|----|----|-----|
|rt|numeric|The response time in ms for the subject to make a response.|
|key_press|numeric|The key that the subject pressed. The value corresponds to the Javascript Char Code (Key Code).|
|correct|boolean|Whether or not the subject's key press corresponded to those provided in correct_choice.|
|frame_rate|numeric|The average frame rate for the trial. 0 denotes that the subject responded before the appearance of the second frame.|
|number_of_frames|numeric|The number of frames that was shown in this trial.|
|frame_rate_array|JSON string|The array that holds the number of miliseconds for each frame in this trial.|
|canvas_width|numeric|The width of the canvas in pixels.|
|canvas_height|numeric|The height of the canvas in pixels.|
                

## Features missing 

The feature to draw a border around the aperture is not implemented yet. Also the feature to present a fixation cross behind the oobs is not implemented yet. (Both features were implemented in the RDK plugin.)

## Example

### Setting the correct_choice parameter by linking it to the coherent_direction parameter:

```javascript
let trial = {
            type: 'rok',
            choices: ['f'],
            correct_choice: 'f',
            trial_duration: 0
        }
```

### Setting the coherent_orientation to right (50% pointing right, 30% pointing left, 20% pointing random).
### The coherent_movement to up (70% percent moving up, 30% moving random). Setting a prompt. 

```javascript
    let trial =  {
        type:'rok',
        prompt: 'Welcome to the demo of a fully cusomizable rok task, >F< to continue',
        choices: ['f', 'j'],
        correct_choice: 'f',
        coherent_orientation: 0, // orientation to the right
        coherent_movement_direction: 90, // movement up
        coherence_orientation: 50, // 50% are orientated right
        coherence_orientation_opposite: 30, // 30% are orientated left (rest random)
        coherence_movement: 70, // 
        coherence_movement_opposite:30,
    };
```

### Setting animated images as stimulus. Fade out images on the edges of the aperture. Mirror images instead of rotating them all the way (no upside down birds)
### Set congruency mode to 2 so that movement and orientation of incoherent oobs match. Randomise movement speed (not direction!) so that oobs move with different speed.
```javascript
    let trial =  {
        type:'rok',
        choices: ['f', 'j'],
        correct_choice: 'f',
        fade_out: 1,
        stimulus_type: 2,
        number_of_oobs: 100,
        oob_size: 10,
        stimulus_image: ['./res/img/stimuli/bird1_4.png'],
        stimulus_image_keyframes:4,
        stimulus_keyframe_time: .1,
        stimulus_mirror: 1,
        coherent_orientation: 0,
        coherent_movement_direction: 0,
        coherence_orientation: 0, // all random orientation
        coherence_orientation_opposite: 0, // all random orientation
        coherence_movement:50, // 50 percent coherent movement
        coherence_movement_opposite:0,  
        experiment_congruency_mode: 2,
        experiment_main_task: 0,
        movement_speed_randomisation: 40,
    };
```

### Setting randomisation to non static (random orientation as well as movement direction change over time). Setting type to animated origami bird
```javascript
    let trial2 =  {
        type:'rok',
        choices: ['f', 'j'],
        correct_choice: 'f',
        stimulus_type: 3, // 0 - triangle, 1-circle, 2-square, 3-origamiBird 4-image
        random_movement_type: 1,
        random_orientation_type: 1,
    };
```

### Layering apertures to create random distractors
```javascript
    let trial = {
        type: 'rok',
        choices: ['f', 'j'],
        correct_choice: 'f',
        trial_duration: 0, 
        coherent_movement_direction: [90,90],
        coherent_orientation: [90,90], 
        coherence_movement: [90,0],
        coherence_orientation: [90,0], 
        coherence_movement_opposite: [10,0], 
        coherence_orientation_opposite: [10,0], 
        movement_speed: [2,5],
        movement_speed_randomisation: [0,50], 
        oob_color: ['green','red'], 
        oob_size: [3,1],
        stimulus_type: [0,1],
        aperture_width: 200,
        aperture_height: 600,
        aperture_shape: 1,  
      
        fade_out: 1,
    };
```
### Demonstrating all main features
```javascript
 let trial5 = {
        type: 'rok',
        number_of_apertures: 3,
        choices: ['f', 'j'],
        correct_choice: 'f',
        trial_duration: 0, // trial_duration, 0 meaning endless
        coherent_movement_direction: [0, 30, 90], // coherent movement direction in degree (0 being right, 90 being up)
        coherent_orientation: [0, 210, 0], // coherent orientation in degree
        coherence_movement: [90, 60, 40], // percentage of oobs (oriented objects) moving in coherent direction
        coherence_orientation: [80, 60, 0], // percentage of oobs being oriented in coherent orientation
        coherence_movement_opposite: [10, 0, 20], // percentage of oobs moving in opposite direction than coherent (rest of oobs moves random)
        coherence_orientation_opposite: [10, 0, 0], // percentage of oobs being oriented in opposite direction of coherent orientation (rest of oobs oriented randomly)
        movement_speed: [7, 5, 2], // movement speed
        movement_speed_randomisation: [30,0,50], // percentage of movement speed randomisation (0 meaning all oobs move with movement speed, 100 meaning speed is assigned randomly between 0 and 2*movement speed
        oob_color: ['lightpink', 'green', 'yellow'], // color of oobs
        oob_color_randomisation: true, // are colors randomised
        background_color: 'gray', // color of background
        number_of_oobs: [300, 200, 100], // number of oobs
        oob_size: [3, 6, 12],
        stimulus_type: [1, 1, 0],// 0 oobs are triangles, 1 oobs are 'paper birds',
        aperture_width: 200,
        aperture_height: 600,
        aperture_shape: [1, 1, 0],  //
        random_movement_type: [0,1,1],
        random_orientation_type: [1,0,1],
        prompt: ['coherent/congruent', 'coherent/incongruent', 'randomness can be manipulated']
    };

    let trial6 = {
        type: 'rok',
        number_of_apertures: 2,
        choices: ['f', 'j'],
        correct_choice: 'f',
        trial_duration: 0, // trial_duration, 0 meaning endless
        coherent_movement_direction: [0,90], // coherent movement direction in degree (0 being right, 90 being up)
        coherent_orientation: [90,0], // coherent orientation in degree
        coherence_movement: [70, 50], // percentage of oobs (oriented objects) moving in coherent direction
        coherence_orientation: [50, 20], // percentage of oobs being oriented in coherent orientation
        coherence_movement_opposite: 10, // percentage of oobs moving in opposite direction than coherent (rest of oobs moves random)
        coherence_orientation_opposite: 10, // percentage of oobs being oriented in opposite direction of coherent orientation (rest of oobs oriented randomly)
        movement_speed: 5, // movement speed
        movement_speed_randomisation: 30, // percentage of movement speed randomisation (0 meaning all oobs move with movement speed, 100 meaning speed is assigned randomly between 0 and 2*movement speed
        oob_color: ['lightpink', 'blue'], // color of oobs
        oob_color_randomisation: true, // are colors randomised
        background_color: 'gray', // color of background
        number_of_oobs: [300, 200], // number of oobs
        oob_size: [3, 2],
        stimulus_type: [1, 0],// 0 oobs are triangles, 1 oobs are 'paper birds',
        aperture_width: [200, 600],
        aperture_height: [600, 200],
        aperture_shape: [1, 0],
        prompt: 'Have fun creating new experiments'
    };
```
