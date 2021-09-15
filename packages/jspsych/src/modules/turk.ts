interface turkInformation {
  /**
   * Is the experiment being loaded in preview mode on Mechanical Turk?
   */
  previewMode: boolean;
  /**
   * Is the experiment being loaded outside of the Mechanical Turk environment?
   */
  outsideTurk: boolean;
  /**
   * The HIT ID.
   */
  hitId: string;
  /**
   * The Assignment ID.
   */
  assignmentId: string;
  /**
   * The worker ID.
   */
  workerId: string;
  /**
   * URL for submission of the HIT.
   */
  turkSubmitTo: string;
}

/**
 * Gets information about the Mechanical Turk Environment, HIT, Assignment, and Worker
 * by parsing the URL variables that Mechanical Turk generates.
 * @returns An object containing information about the Mechanical Turk Environment, HIT, Assignment, and Worker.
 */
export function turkInfo(): turkInformation {
  const turk: turkInformation = {
    previewMode: false,
    outsideTurk: false,
    hitId: "INVALID_URL_PARAMETER",
    assignmentId: "INVALID_URL_PARAMETER",
    workerId: "INVALID_URL_PARAMETER",
    turkSubmitTo: "INVALID_URL_PARAMETER",
  };

  const param = function (url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regexS = "[\\?&]" + name + "=([^&#]*)";
    const regex = new RegExp(regexS);
    const results = regex.exec(url);
    return results == null ? "" : results[1];
  };

  const src = param(window.location.href, "assignmentId")
    ? window.location.href
    : document.referrer;

  const keys = ["assignmentId", "hitId", "workerId", "turkSubmitTo"];
  keys.map(function (key) {
    turk[key] = unescape(param(src, key));
  });

  turk.previewMode = turk.assignmentId == "ASSIGNMENT_ID_NOT_AVAILABLE";

  turk.outsideTurk =
    !turk.previewMode && turk.hitId === "" && turk.assignmentId == "" && turk.workerId == "";

  return turk;
}

/**
 * Send data to Mechnical Turk for storage.
 * @param data An object containing `key:value` pairs to send to Mechanical Turk. Values
 * cannot contain nested objects, arrays, or functions.
 * @returns Nothing
 */
export function submitToTurk(data) {
  const turk = turkInfo();
  const assignmentId = turk.assignmentId;
  const turkSubmitTo = turk.turkSubmitTo;

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
