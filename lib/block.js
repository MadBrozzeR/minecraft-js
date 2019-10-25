function Block (id, state, nbt) {
  this.id = id;
  this.state = state;
  this.nbt = nbt;
}
Block.prototype.toString = function () {
  let result = this.id;
  if (this.state) {
    const states = [];

    for (const key in this.state) {
      states.push(key + '=' + this.state[key]);
    }

    result += '[' + states.join() + ']'
  }

  if (this.nbt) {
    const nbts = [];

    for (const key in this.nbt) {
      nbts.push(key + ':' + this.nbt[key]);
    }

    result += '{' + nbts.join() + '}';
  }

  return result;
}

module.exports = {
  block: function (id, state, nbt) {
    return new Block(id, state, nbt);
  }
}
