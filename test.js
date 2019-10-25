const { RConnect, print } = require('./client.js');
const { player } = require('./lib/player.js');
const { block } = require('./lib/block.js');
const { gamerule } = require('./lib/utils.js');

RConnect('111', function (mc) {
  mc.send('list').then(print);
  gamerule(mc, {
    doWeatherCycle: false,
    doDaylightCycle: false
  }).then(print);
  mc.send('time set noon').then(print);

  mc.stop();
});
