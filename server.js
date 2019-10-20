const MCRes = require('mc-resource');
const fs = require('fs');
const {spawn} = require('child_process');

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
  MCRes.getVersion(version)
    .then(function (version) {
      MCRes.download(version.downloads.server)
        .then(function (data) {
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

function start ({path = DEFAULT_PATH} = {}) {
  const child = spawn('java', ['-Xms1G', '-Xmx4G', '-jar', 'server.jar', 'nogui'], {
    cwd: path
  });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  process.stdin.pipe(child.stdin);
}

module.exports = {
  list,
  install,
  start
};
