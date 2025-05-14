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

// adapted from: https://www.kirupa.com/snippets/move_element_to_click_position.htm
export function getPosition(el: HTMLElement) {
  // Added type for el
  var xPos = 0;
  var yPos = 0;
  const elWidth = el.offsetWidth; // Get the width of the element
  const elHeight = el.offsetHeight; // Get the height of the element

  while (el) {
    var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
    var yScroll = el.scrollTop || document.documentElement.scrollTop;
    xPos += el.offsetLeft - xScroll + el.clientLeft;
    yPos += el.offsetTop - yScroll + el.clientTop;
    el = el.offsetParent as HTMLElement; // Added type assertion
  }
  return {
    x: xPos + elWidth / 2, // Adjust x to be the center
    y: yPos + elHeight / 2, // Adjust y to be the center
  };
}
