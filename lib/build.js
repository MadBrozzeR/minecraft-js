const fs = require('fs');
const { block } = require('./block.js');
const { setblock, fill } = require('./utils.js');

const air = block('air');

function Palette (palette) {
  this.palette = palette;
}

const HEADER_RE = /^(\d+);(\d+);(\d+)$/;

Palette.prototype.build = function build ([x, y, z], file, {
  apply,
  onDone
} = {}) {
  const palette = this.palette;
  let coords = [0, 0, 0];
  let shift = [0, 0];
  let repeat;
  let char;
  let lastChar;
  const result = [];
  let header = '';
  let readHeader = true;

  const stream = fs.createReadStream(file);
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
          const command = setblock(palette[char] || air, [
            x + shift[0] + coords[0],
            y + coords[1],
            z + shift[1] + coords[2]
          ]);
          ++coords[0];
          (apply instanceof Function) ? apply(command) : result.push(command);
        } else if (repeat > 1) {
          const command = fill(palette[char] || air, [
            x + shift[0] + coords[0],
            y + coords[1],
            z + shift[1] + coords[2]
          ], [
            x + shift[0] + coords[0],
            y + repeat - 1 + coords[1],
            z + shift[1] + coords[2]
          ]);
          ++coords[0];
          (apply instanceof Function) ? apply(command) : result.push(command);
        }
      }
      lastChar = char;
    }
  }).on('end', function () {
    (onDone instanceof Function) && onDone(result);
  });
};

module.exports = {
  Palette
};