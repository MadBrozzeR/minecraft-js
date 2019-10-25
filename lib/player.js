function Player (name, rcon) {
  this.name = name;
  this.rcon = rcon;
}

Player.prototype.tp = function (x, y, z) {
  this.rcon.send(`teleport ${this.name} ${x} ${y} ${z}`);

  return this;
}
Player.prototype.setblock = function (block, [x, y, z], mode = 'replace') {
  let command = `execute as ${this.name} at @s run setblock ${x} ${y} ${z} ${block} ${mode}`;
  this.rcon.send(command);

  return this;
}
Player.prototype.gamemode = function (mode) {
  this.rcon.send(`gamemode ${mode} ${this.name}`);
}


module.exports = {
  player: function (name, rcon) {
    return new Player(name, rcon);
  }
};
