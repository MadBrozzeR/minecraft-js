const server = require('./server.js');

/**
 * path - server installation path (default: './server/')
 * java - java binary path (default: 'java')
 * snaps - use snapshots in listing
 * skip - skip N last versions
 * install - install version (even if it is already exists) and exit
 * port - port for connection server
 */
const args = {};

const ARG_RE = /^--([-\w]+)(?:=(.+))?$/;

for (let index = 2 ; index < process.argv.length ; ++index) {
  const regMatch = ARG_RE.exec(process.argv[index]);

  if (regMatch) {
    args[regMatch[1]] = regMatch[2] === undefined ? true : regMatch[2];
  }
}

function handleError (error) {
  console.log(error);
}

function install (args) {
  console.log('Installation process started');

  return new Promise(function (resolve, reject) {
    server.list(args).then(function (list) {
      server.install(list[0], args).then(function () {
        resolve();
      }).catch(function (error) {
        reject(error);
      });
    }).catch(handleError);
  });
}

if (args.install) {
  install(args).then(function () {
    console.log('Server installed');
  }).catch(handleError);
} else {
  server.checkInstallation().then(function () {
    console.log('Server is already installed. Starting server');
    server.start(args);
  }).catch(function () {
    install(args).then(function () {
      console.log('Starting server');
      server.start(args);
    }).catch(handleError);
  });
}
