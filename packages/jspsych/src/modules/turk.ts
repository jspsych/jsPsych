// core.turkInfo gets information relevant to mechanical turk experiments. returns an object
// containing the workerID, assignmentID, and hitID, and whether or not the HIT is in
// preview mode, meaning that they haven't accepted the HIT yet.
export function turkInfo() {
  var turk = <any>{};

  var param = function (url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results == null ? "" : results[1];
  };

  var src = param(window.location.href, "assignmentId") ? window.location.href : document.referrer;

  var keys = ["assignmentId", "hitId", "workerId", "turkSubmitTo"];
  keys.map(function (key) {
    turk[key] = unescape(param(src, key));
  });

  turk.previewMode = turk.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE";

  turk.outsideTurk =
    !turk.previewMode && turk.hitId === "" && turk.assignmentId == "" && turk.workerId == "";

  // TODO Was this intended to set a global variable?
  // turk_info = turk;

  return turk;
}

// core.submitToTurk will submit a MechanicalTurk ExternalHIT type
export function submitToTurk(data) {
  var turkInfo = turkInfo();
  var assignmentId = turkInfo.assignmentId;
  var turkSubmitTo = turkInfo.turkSubmitTo;

  if (!assignmentId || !turkSubmitTo) return;

  var dataString = [];

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      dataString.push(key + "=" + escape(data[key]));
    }
  }

  dataString.push("assignmentId=" + assignmentId);

  var url = turkSubmitTo + "/mturk/externalSubmit?" + dataString.join("&");

  window.location.href = url;
}
