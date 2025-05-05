export type boxArea = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export function inside_box(x: number, y: number, box_areas: boxArea[]): string | null {
  for (const box_area of box_areas) {
    const { id, left, top, width, height } = box_area;
    const right = left + width;
    const bottom = top + height;

    if (x >= left && x <= right && y >= top && y <= bottom) {
      return id; // point is inside this box
    }
  }
  return null; // point not inside any box
}
