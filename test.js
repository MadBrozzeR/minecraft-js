const connect = require('./client.js');

connect(function (socket) {
  socket.write('list\n');
});
