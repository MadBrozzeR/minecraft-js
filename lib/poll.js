function Poll (cases) {
  this.cases = cases;
  this.total = 0;

  for (let index = 0 ; index < cases.length ; ++index) {
    this.total += cases[index].weight;
  }
}

Poll.prototype.get = function () {
  let value = Math.random() * this.total;

  for (let index = 0 ; index < this.cases.length ; ++index) {
    if ((value -= this.cases[index].weight) <= 0) {
      return this.cases[index].item;
    }
  }
}

function poll (cases) {
  return new Poll(cases);
}

module.exports = {
  Poll,
  poll
};
