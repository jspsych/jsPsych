export type boxArea = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export function inside_box(
  x: number,
  y: number,
  margin: number,
  box_areas: boxArea[]
): string | null {
  for (const box_area of box_areas) {
    const { id, left, top, width, height } = box_area;
    const right = left + width;
    const bottom = top + height;

    // if x is +- margin of left and y is +- margin of top
    if (x >= left - margin && x <= right + margin && y >= top - margin && y <= bottom + margin) {
      return id; // point is inside the box
    }
  }
  return null; // point not inside any box
}

// https://www.kirupa.com/snippets/move_element_to_click_position.htm
export function getPosition(el) {
  var xPos = 0;
  var yPos = 0;

  while (el) {
    if (el.tagName == "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      var yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += el.offsetLeft - xScroll + el.clientLeft;
      yPos += el.offsetTop - yScroll + el.clientTop;
    } else {
      // for all other non-BODY elements
      xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
      yPos += el.offsetTop - el.scrollTop + el.clientTop;
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos,
  };
}

export function random_coordinate(min_width, min_height, max_width, max_height) {
  const rnd_x = Math.floor(Math.random() * (max_width - min_width + 1)) + min_width;
  const rnd_y = Math.floor(Math.random() * (max_height - min_height + 1)) + min_height;
  return {
    x: rnd_x,
    y: rnd_y,
  };
}
