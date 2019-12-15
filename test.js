const { block } = require('./lib/block.js');
const { RConnect, print } = require('./client.js');
const { player } = require('./lib/player.js');
const { gamerule } = require('./lib/utils.js');
const { poll } = require('./lib/poll.js');
const { Palette } = require('./lib/build.js');

const walls = poll([
  {
    item: block('stone_bricks'),
    weight: 8
  },
  {
    item: block('stone'),
    weight: 1
  },
  {
    item: block('cracked_stone_bricks'),
    weight: 1
  }
]);

const palette = {
  ' ': block('air'),
  w: block('stone_bricks'),
  f: block('acacia_planks'),
  o: block('glass'),
  d: block('acacia_door', {half: 'lower', facing: 'west'}),
  D: block('acacia_door', {half: 'upper', facing: 'west'}),
  s: block('stone'),
  g: block('glass'),
  t: block('stone_brick_stairs', {facing: 'west'}),
  r: block('redstone_wire')
};

RConnect('111', function (mc) {
  const madbrozzer = player('madbrozzer', mc);

  new Palette(palette).build('10 70 10', './builds/castle.txt', {
    apply: function (command) {
      mc.send(command);
    }
  }).then(function (data) {
    mc.stop();
  });
  // mc.send('execute as @e[type=!player,limit=1] run say Hello world!');
});
