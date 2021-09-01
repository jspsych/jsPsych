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
  const turkInfo = module.exports.turkInfo();
  const assignmentId = turkInfo.assignmentId;
  const turkSubmitTo = turkInfo.turkSubmitTo;

  if (!assignmentId || !turkSubmitTo) return;

  const form = document.createElement("form");
  form.method = "POST";
  form.action = turkSubmitTo + "/mturk/externalSubmit?assignmentId=" + assignmentId;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const hiddenField = document.createElement("input");
      hiddenField.type = "hidden";
      hiddenField.name = key;
      hiddenField.id = key;
      hiddenField.value = data[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}
