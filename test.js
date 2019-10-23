const connect = require('./client.js');

connect(function (socket) {
  /*
  socket.write('time set 6000\n');
  socket.write('gamerule doDaylightCycle false\n');
  socket.write('weather clear\n');
  socket.write('gamerule doWeatherCycle false\n');
  socket.write('gamemode spectator madbrozzer\n');
  */
  socket.end();
});
