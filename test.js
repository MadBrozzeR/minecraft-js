const { block } = require('./lib/block.js');
const { RConnect, print } = require('./client.js');
const { player } = require('./lib/player.js');
const { gamerule } = require('./lib/utils.js');

const palette = {
  ' ': block('air'),
  w: block('stone_bricks'),
  f: block('acacia_planks'),
  o: block('glass'),
  d: block('acacia_door', {half: 'lower', facing: 'west'}),
  D: block('acacia_door', {half: 'upper', facing: 'west'}),
  s: block('stone'),
  g: block('glass')
};

RConnect('111', function (mc) {
  const madbrozzer = player('madbrozzer', mc);

  madbrozzer.build('90 70 70', palette, './builds/castle.txt').then(function () {
    mc.stop();
  });
});
