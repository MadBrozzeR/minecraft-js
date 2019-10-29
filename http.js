const http = require('http');
const https = require('https');
const MadSocket = require('madsocket');
const { Connect } = require('./client.js');

const port = 8070;

const CONNECT_RE = /^\[[\d:]+\] [^:]+: UUID of player (\w+) is ([-0-9a-f]+)/;
const DISCONNECT_RE = /^\[[\d:]+\] [^:]+: (\w+) left the game/;

const cached = {};

const BODY = `
<html>
<head>
<title>Online players</title>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
<style>
.picture {
  display: inline-block;
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  background-size: 800%;
  background-position: -32px -32;
  vertical-align: middle;
}

.picture.layer {
  margin-left: -32px;
  background-position-x: -160px;
}
.name {
  display: inline-block;
  vertical-align: middle;
  font-size: 24px;
  margin-left: 10px;
}

#list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
<script>
function player (info) {
  var prop = JSON.parse(atob(info.properties[0].value));

  var element = document.createElement('div');
  var picture = element.appendChild(document.createElement('span'));
  var pictureLayer = element.appendChild(document.createElement('span'));
  var name = element.appendChild(document.createElement('span'));
  element.className = 'list-item';
  picture.className = 'picture';
  pictureLayer.className = 'picture layer';
  name.className = 'name';
  name.innerHTML = prop.profileName;
  picture.style.backgroundImage = 'url("' + prop.textures.SKIN.url + '")';
  pictureLayer.style.backgroundImage = 'url("' + prop.textures.SKIN.url + '")';

  return element;
}
window.onload = function () {
  var list = document.getElementById('list');

  var ws = new WebSocket('ws://192.168.1.201:8070/ws');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);
    list.innerHTML = '';

    for (var key in data) {
      list.appendChild(player(data[key]));
    }
  }
}
</script>
</head>
<body>
  <div id="list"></div>
</body>
</html>
`;

function cutDashes (str) {
  return str.replace(/-/g, '');
}

function getProfile (uuid) {
  return new Promise(function (resolve, reject) {
    if (cached[uuid]) {
      resolve(cached[uuid]);
    } else {
      https.get('https://sessionserver.mojang.com/session/minecraft/profile/' + cutDashes(uuid), function (request) {
        const chunks = [];
        let length = 0;

        request.on('data', function (chunk) {
          chunks.push(chunk);
          length += chunk.length;
        }).on('end', function () {
          try {
            const response = Buffer.concat(chunks, length).toString();
            const data = JSON.parse(response);

            cached[uuid] = data;
            resolve(data);
          } catch (error) {
            reject(error);
          }
        }).on('error', function (error) {
          reject(error);
        });
      });
    }
  });
}

Connect(function (mc) {
  const clients = [];
  const players = {};

  function sendPlayers (client) {
    client.send(JSON.stringify(players));
  }

  function sendPlayersToAll () {
    for (let index = 0 ; index < clients.length ; ++index) {
      sendPlayers(clients[index]);
    }
  }

  const ws = new MadSocket({
    connect: function () {
      clients.push(this);
      sendPlayers(this);
    },
    disconnect: function () {
      const index = clients.indexOf(this);
      clients.splice(index, 1);
    },
    error: function (error) {
      console.log(error);
    }
  });

  mc.on('data', function (chunk) {
    const data = chunk.toString();
    let regMatch = CONNECT_RE.exec(data);

    if (regMatch) {
      getProfile(regMatch[2]).then(function (profile) {
        players[regMatch[1]] = profile;
        sendPlayersToAll();
      }).catch(function (error) {
        console.log(error);
      });
    } else if (regMatch = DISCONNECT_RE.exec(data)) {
      delete players[regMatch[1]];
      sendPlayersToAll();
    }
  });
  http.createServer(function (request, response) {
    switch (request.url) {
      case '/':
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(BODY);
        break;
      case '/favicon.ico':
        response.writeHead(200, {'Content-Type': 'image/x-icon'});
        response.end();
        break;
      case '/ws':
        ws.leach(request, response);
        break;
    }
  }).listen(port, function () {
    console.log('HTTP server is running on port ' + port);
  });
});
