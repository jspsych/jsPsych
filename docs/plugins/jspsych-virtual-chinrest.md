# jspsych-virtual-chin-rest plugin

This plugin consist in two parts:

To first calculate a participant’s display, participants are asked to place a credit card-sized card on the screen and adjust the slider on the screen to fit the credit card. That allows the researchers to calculate the pixel density on the monitor.

To measure the user’s distance from his or her monitor, there is also a blind spot task. Testers are asked to focus on a black square on the screen with their right eye closed, while a red dot repeatedly sweeps from right to left. They must hit the spacebar on their keyboards whenever it appears that the red dot has disappeared. That allows researchers to determine the distance between the center of the black square and the center of the red dot when it disappears from eyesight and understand how far the participant is from the monitor.


We would appreciate it if you cited this paper when you use the virtual-chin-rest plugin: 

**Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for Participants’ Viewing Distance in Large-Scale, Psychophysical Online Experiments Using a Virtual Chinrest. Scientific Reports, 10(1), 1-11. DOI: [10.1038/s41598-019-57204-1]**



## Parameters

Parameters can be left unspecified if the default value is acceptable.

|Parameter|Type|Default Value| Descripton|
|---------|----|-------------|-----------|


## Data Generated

In addition to the default data collected by all plugins, this plugin collects all parameter data described above and the following data for each trial.


|Name|Type|Value|
|----|----|-----|
viewing_distance_cm|numeric|
cardWidth_px| numeric
screen_size_px| char

## Example


```javascript
var chin = {   

		type: 'virtual-chin'
			
    }
