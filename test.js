const server = require('./server.js');

const args = {};

const ARG_RE = /^--([-\w]+)(?:=(.+))?$/;

for (let index = 2 ; index < process.argv.length ; ++index) {
  const regMatch = ARG_RE.exec(process.argv[index]);

  if (regMatch) {
    args[regMatch[1]] = regMatch[2] === undefined ? true : regMatch[2];
  }
}

/*
server.list(args).then(function (list) {
  server.install(list[0], args).then(function () {
    console.log('OK!!!!!')
  }).catch(function (error) {
    console.log(error);
  });
}).catch(function (error) {console.log(error);});
*/
server.start();
