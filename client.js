const net = require('net');

let port = 2038;

module.exports = function (callback) {
  const socket = net.Socket();
  socket.connect(port, function () {
    callback(socket);
  });
}
module.exports.port = function (newPort) {
  port = newPort;

  return module.exports;
}
