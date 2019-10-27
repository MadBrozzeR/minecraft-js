const fs = require('fs');
const { setblock, fill, Coords } = require('./utils.js');
const { Poll } = require('./poll.js');

function Palette (palette) {
  this.palette = palette;
}

const HEADER_RE = /^(\d+);(\d+);(\d+)$/;

Palette.prototype.build = function build (initCoords, file, {
  apply,
  onDone
} = {}) {
  const palette = this.palette;
  initCoords = new Coords(initCoords);
  let coords = [0, 0, 0];
  let shift = [0, 0];
  let repeat;
  let char;
  let lastChar;
  const result = [];
  let header = '';
  let readHeader = true;
  const stream = fs.createReadStream(file);

  return new Promise(function (resolve, reject) {
    stream.on('readable', function () {
      while (char = this.read(1)) {
        char = char.toString();

        if (char === '\r') {
          continue;
        }

        if (char === '\n') {
          if (lastChar === char) {
            coords[0] = coords[2] = 0;
            coords[1] += repeat;
            readHeader = true;
            header = '';
          } else {
            if (readHeader) {
              const regMatch = HEADER_RE.exec(header);

              if (regMatch) {
                shift[0] = parseInt(regMatch[1], 10);
                shift[1] = parseInt(regMatch[2], 10);
                repeat = parseInt(regMatch[3], 10);
              } else {
                throw new Error('Wrong header format: ' + header);
              }

              readHeader = false;
            } else {
              coords[0] = 0;
              coords[2]++;
            }
          }
        } else {
          if (readHeader) {
            header += char;
          } else if (repeat === 1) {
            if (palette[char]) {
              const block = (palette[char] instanceof Poll) ? palette[char].get() : palette[char];
              const command = setblock(block, initCoords.getRelative(
                shift[0] + coords[0],
                coords[1],
                shift[1] + coords[2]
              ));
              (apply instanceof Function) ? apply(command) : result.push(command);
            }
            ++coords[0];
          } else if (repeat > 1) {
            if (palette[char]) {
              const block = (palette[char] instanceof Poll) ? palette[char].get() : palette[char];
              const command = fill(block, initCoords.getRelative(
                shift[0] + coords[0],
                coords[1],
                shift[1] + coords[2]
              ), initCoords.getRelative(
                shift[0] + coords[0],
                repeat - 1 + coords[1],
                shift[1] + coords[2]
              ));
              (apply instanceof Function) ? apply(command) : result.push(command);
            }
            ++coords[0];
          }
        }
        lastChar = char;
      }
    }).on('end', function () {
      resolve(result);
    }).on('error', reject);
  });
};

module.exports = {
  Palette
};
