export class DataColumn {
  constructor(public values = []) {}

  sum() {
    var s = 0;
    for (var i = 0; i < this.values.length; i++) {
      s += this.values[i];
    }
    return s;
  }

  mean() {
    return this.sum() / this.count();
  }

  median() {
    if (this.values.length == 0) {
      return undefined;
    }
    var numbers = this.values.slice(0).sort(function (a, b) {
      return a - b;
    });
    var middle = Math.floor(numbers.length / 2);
    var isEven = numbers.length % 2 === 0;
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
    var mean = this.mean();
    var sum_square_error = 0;
    for (var i = 0; i < this.values.length; i++) {
      sum_square_error += Math.pow(this.values[i] - mean, 2);
    }
    var mse = sum_square_error / (this.values.length - 1);
    return mse;
  }

  sd() {
    var mse = this.variance();
    var rmse = Math.sqrt(mse);
    return rmse;
  }

  frequencies() {
    var unique = {};
    for (var i = 0; i < this.values.length; i++) {
      var v = this.values[i];
      if (typeof unique[v] == "undefined") {
        unique[v] = 1;
      } else {
        unique[v]++;
      }
    }
    return unique;
  }

  all(eval_fn) {
    for (var i = 0; i < this.values.length; i++) {
      if (!eval_fn(this.values[i])) {
        return false;
      }
    }
    return true;
  }

  subset(eval_fn) {
    var out = [];
    for (var i = 0; i < this.values.length; i++) {
      if (eval_fn(this.values[i])) {
        out.push(this.values[i]);
      }
    }
    return new DataColumn(out);
  }
}
