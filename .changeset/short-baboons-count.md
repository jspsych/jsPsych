---
"jspsych": major
---

Renamed all getter-type functions to have `get` prefix to make it clearer what the role of these functions are. The following were affected:
- `currentTimelineNodeID` -> `getCurrentTimelineNodeID`
- `progress` -> `getProgress`
- `startTime` -> `getStartTime`
- `totalTime` -> `getTotalTime`
- `currentTrial` -> `getCurrentTrial`
- `initSettings` -> `getInitSettings`
- `allTimelineVariables` -> `getAllTimelineVariables`
