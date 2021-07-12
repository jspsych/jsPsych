// private function to save text file on local drive
export function saveTextToFile(textstr: string, filename: string) {
  const blobToSave = new Blob([textstr], {
    type: "text/plain",
  });
  let blobURL = "";
  if (typeof window.webkitURL !== "undefined") {
    blobURL = window.webkitURL.createObjectURL(blobToSave);
  } else {
    blobURL = window.URL.createObjectURL(blobToSave);
  }

  const link = document.createElement("a");
  link.id = "jspsych-download-as-text-link";
  link.style.display = "none";
  link.download = filename;
  link.href = blobURL;
  link.click();
}

// this function based on code suggested by StackOverflow users:
// http://stackoverflow.com/users/64741/zachary
// http://stackoverflow.com/users/317/joseph-sturtevant

export function JSON2CSV(objArray) {
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var line = "";
  var result = "";
  var columns = [];

  var i = 0;
  for (var j = 0; j < array.length; j++) {
    for (var key in array[j]) {
      var keyString = key + "";
      keyString = '"' + keyString.replace(/"/g, '""') + '",';
      if (!columns.includes(key)) {
        columns[i] = key;
        line += keyString;
        i++;
      }
    }
  }

  line = line.slice(0, -1);
  result += line + "\r\n";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var j = 0; j < columns.length; j++) {
      var value = typeof array[i][columns[j]] === "undefined" ? "" : array[i][columns[j]];
      if (typeof value == "object") {
        value = JSON.stringify(value);
      }
      var valueString = value + "";
      line += '"' + valueString.replace(/"/g, '""') + '",';
    }

    line = line.slice(0, -1);
    result += line + "\r\n";
  }

  return result;
}

// this function is modified from StackOverflow:
// http://stackoverflow.com/posts/3855394

export function getQueryString() {
  var a = window.location.search.substr(1).split("&");
  var b = {};
  for (var i = 0; i < a.length; ++i) {
    var p = a[i].split("=", 2);
    if (p.length == 1) b[p[0]] = "";
    else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
}
