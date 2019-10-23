const MCRes = require('mc-resource');
const fs = require('fs');
const {spawn} = require('child_process');
const net = require('net');

const EULA = '#By changing the setting below to TRUE you are indicating your agreement to our EULA' +
  ' (https://account.mojang.com/documents/minecraft_eula).\n#${date}\neula=true\n'

const DEFAULT_PATH = './server/';

let manifest;

function getVersions(count = Infinity, skip = 0, snaps = false) {
  const result = [];

  for (let index = 0 ; count && index < manifest.versions.length ; ++index) {
    let version = manifest.versions[index];

    if (version.type === 'release' || snaps) {
      if (skip) {
        --skip;
      } else {
        --count;
        result.push(version);
      }
    }
  }

  return result;
}

function Progress (size) {
  this.size = size;
  process.stdout.write('0%');
}
Progress.prototype.update = function (size) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(~~(size / this.size * 100) + '%');
};
Progress.prototype.done = function () {
  process.stdout.write('\n');
}

function list ({count, skip, snaps}) {
  return new Promise(function (resolve, reject) {
    if (manifest) {
      resolve(getVersions(count, skip, snaps));
    } else {
      MCRes.getManifest()
        .then(function (result) {
          manifest = result;
          resolve(getVersions(count, skip, snaps));
        }).catch(function (error) {
          reject(error);
        });
    }
  });
}

function installServer (version, path, resolve, reject) {
  console.log('Downloading version list');

  MCRes.getVersion(version)
    .then(function (version) {
      const artifact = version.downloads.server;

      process.stdout.write('Downloading server v.' + version.id + '...\n');
      const progress = new Progress(artifact.size);

      MCRes.download(artifact, {
        onProgress: function (bytes) {
          progress.update(bytes);
        }
      })
        .then(function (data) {
          progress.done();

          fs.writeFile(path + '/server.jar', data, function (error) {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        }).catch(reject);
    }).catch(reject)
}

function eulaAgreement (version, path, resolve, reject) {
  const eulaPath = path + '/eula.txt';
  fs.access(eulaPath, function (error) {
    if (error) {
      console.log('EULA agreement acctpted');
      fs.writeFile(eulaPath, EULA.replace('${date}', new Date().toString()), function (error) {
        if (error) {
          reject(error);
        } else {
          installServer(version, path, resolve, reject);
        }
      });
    } else {
      installServer(version, path, resolve, reject);
    }
  });
}

function install (version, {path = DEFAULT_PATH} = {}) {
  return new Promise(function (resolve, reject) {
    fs.access(path, function (error) {
      if (error) {
        console.log('Creating directory ' + path + '...');

        fs.mkdir(path, {recursive: true}, function (error) {
          if (error) {
            reject(error);
          } else {
            eulaAgreement(version, path, resolve, reject);
          }
        });
      } else {
        eulaAgreement(version, path, resolve, reject);
      }
    });
  });
}

function checkInstallation ({path = DEFAULT_PATH} = {}) {
  return new Promise(function (resolve, reject) {
    fs.access(path + '/server.jar', function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function start ({path = DEFAULT_PATH, java = 'java', port = 2038} = {}) {
  const child = spawn(java, ['-Xms1G', '-Xmx4G', '-jar', 'server.jar', 'nogui'], {
    cwd: path
  });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  process.stdin.pipe(child.stdin);
  child.stdin.on('error', function (error) {
    console.log(error);
  });

  const server = net.createServer().listen(port, function () {
    console.log('Server started on port ' + port);
  });

  server.on('connection', function (socket) {
    child.stdout.pipe(socket);
    function onData (chunk) {
      child.stdin.write(chunk);
    }
    socket.on('data', onData);
    socket.on('end', function () {
      child.stdout.unpipe(socket);
      socket.removeListener('data', onData);
    });
    socket.on('error', function (error) {
      console.log(error);
    });
  });

  child.on('close', function () {
    server.close();
  });

  server.on('close', function () {
    process.exit(0);
  });

  server.on('error', function (error) {
    console.log(error);
  });
}

module.exports = {
  list,
  install,
  start,
  checkInstallation
};
