const { block } = require('./lib/block.js');
const { RConnect, print } = require('./client.js');
const { player } = require('./lib/player.js');
const { gamerule } = require('./lib/utils.js');

RConnect('111', function (mc) {
/*
  mc.send('list').then(print);
  gamerule(mc, {
    doWeatherCycle: false,
    doDaylightCycle: false
  }).then(print);
  mc.send('time set noon').then(print);
*/
  const madbrozzer = player('madbrozzer', mc);

  madbrozzer.build('~10 ~ ~10', {
    s: block('stone'),
    g: block('glass')
  }, 'build.txt').then(function () {
    mc.stop();
  });
});
/*
const { Palette } = require('./lib/build.js');

const palette = new Palette({
  s: block('stone'),
  g: block('glass')
});
palette.build([0, 0, 0], './build.txt', {
  onDone: function (result) {
    console.log(result);
  }
});
*/
