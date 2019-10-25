const net = require('net');
const Rcon = require('mbr-rcon');

let port = 2038;
let rconPort = 25575;

function Connect (callback) {
  const socket = net.Socket();
  socket.connect(port, function () {
    callback(socket);
  });
}
Connect.port = function (newPort) {
  port = newPort;

  return Connect;
}

function RconConnection (connection) {
  this.connection = connection;
}

RconConnection.prototype.send = function (command) {
  const connection = this.connection;

  return new Promise(function (resolve, reject) {
    connection.send(command, {
      onSuccess: resolve,
      onError: reject
    });
  });
};

RconConnection.prototype.stop = function () {
  this.connection.close({
    onError: function (error) {
      throw error;
    }
  });
}

function RConnect (password, callback) {
  const rcon = new Rcon({
    port: rconPort
  });

  const connection = rcon.connect({
    onError: function (error) {
      throw error;
    }
  });

  connection.auth({
    password,
    onSuccess: function () {
      callback(new RconConnection(connection));
    },
    onError: function (error) {
      throw error;
    }
  });
}

RConnect.port = function (newPort) {
  rconPort = newPort;

  return RConnect;
}

function print (data) {
  console.log(data);
}

module.exports = {
  Connect,
  RConnect,
  print
};
