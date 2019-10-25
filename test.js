const { RConnect, print } = require('./client.js');

/*
connect(function (socket) {
  socket.write('time set 6000\n');
  socket.write('gamerule doDaylightCycle false\n');
  socket.write('weather clear\n');
  socket.write('gamerule doWeatherCycle false\n');
  socket.write('gamemode spectator madbrozzer\n');
  socket.end();
});
*/

RConnect(111, function (mc) {
  mc.send('list').then(print);
  mc.stop();
});
