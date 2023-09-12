export function shuffle(array) {
  // define three variables
  let cur_idx = array.length,
    tmp_val,
    rand_idx;

  // While there remain elements to shuffle...
  while (0 !== cur_idx) {
    // Pick a remaining element...
    rand_idx = Math.floor(Math.random() * cur_idx);
    cur_idx -= 1;

    // And swap it with the current element.
    tmp_val = array[cur_idx];
    array[cur_idx] = array[rand_idx];
    array[rand_idx] = tmp_val;
  }
  return array;
}

export function make_arr(startValue, stopValue, cardinality) {
  const step = (stopValue - startValue) / (cardinality - 1);
  let arr = [];
  for (let i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

export function inside_ellipse(x, y, x0, y0, rx, ry, square = false) {
  const results = [];
  if (square) {
    return Math.abs(x - x0) <= rx && Math.abs(y - y0) <= ry;
  } else {
    return (x - x0) * (x - x0) * (ry * ry) + (y - y0) * (y - y0) * (rx * rx) <= rx * rx * (ry * ry);
  }
}

export function random_coordinate(max_width, max_height) {
  const rnd_x = Math.floor(Math.random() * (max_width - 1));
  const rnd_y = Math.floor(Math.random() * (max_height - 1));
  return {
    x: rnd_x,
    y: rnd_y,
  };
}
