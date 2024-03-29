const { Palette } = require('./build.js');
const { setblock, Coords } = require('./utils.js');

function Player (name, rcon) {
  this.name = name;
  this.rcon = rcon;
}

Player.prototype.tp = function (dest) {
  const destination = dest instanceof Player ? dest.name : new Coords(dest);
  this.rcon.send(`teleport ${this.name} ${destination}`);

  return this;
}
Player.prototype.execute = function (command) {
  this.rcon.send(`execute as ${this.name} at @s run ${command}`);

  return this;
}
Player.prototype.setblock = function (block, position, mode) {
  let command = setblock(block, position, mode);
  this.execute(command);

  return this;
}
Player.prototype.gamemode = function (mode) {
  this.rcon.send(`gamemode ${mode} ${this.name}`);

  return this;
}
Player.prototype.build = function (position, palette, file) {
  const player = this;

  return new Palette(palette).build(position, file, {
    apply: function (command) {
      player.execute(command);
    }
  });
}

module.exports = {
  player: function (name, rcon) {
    return new Player(name, rcon);
  }
};
