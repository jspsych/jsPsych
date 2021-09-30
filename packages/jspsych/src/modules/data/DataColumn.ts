export class DataColumn {
  constructor(public values = []) {}

  sum() {
    let s = 0;
    for (const v of this.values) {
      s += v;
    }
    return s;
  }

  mean() {
    return this.sum() / this.count();
  }

  median() {
    if (this.values.length === 0) {
      return undefined;
    }
    const numbers = this.values.slice(0).sort(function (a, b) {
      return a - b;
    });
    const middle = Math.floor(numbers.length / 2);
    const isEven = numbers.length % 2 === 0;
    return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
  }

  min() {
    return Math.min.apply(null, this.values);
  }

  max() {
    return Math.max.apply(null, this.values);
  }

  count() {
    return this.values.length;
  }

  variance() {
    const mean = this.mean();
    let sum_square_error = 0;
    for (const x of this.values) {
      sum_square_error += Math.pow(x - mean, 2);
    }
    const mse = sum_square_error / (this.values.length - 1);
    return mse;
  }

  sd() {
    const mse = this.variance();
    const rmse = Math.sqrt(mse);
    return rmse;
  }

  frequencies() {
    const unique = {};
    for (const x of this.values) {
      if (typeof unique[x] === "undefined") {
        unique[x] = 1;
      } else {
        unique[x]++;
      }
    }
    return unique;
  }

  all(eval_fn) {
    for (const x of this.values) {
      if (!eval_fn(x)) {
        return false;
      }
    }
    return true;
  }

  subset(eval_fn) {
    const out = [];
    for (const x of this.values) {
      if (eval_fn(x)) {
        out.push(x);
      }
    }
    return new DataColumn(out);
  }
}
