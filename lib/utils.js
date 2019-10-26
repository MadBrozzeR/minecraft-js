function gamerule (mc, rules) {
  return new Promise(function (resolve, reject) {
    const response = [];
    let counter = 0;

    function onResponse (data) {
      response.push(data);

      if (--counter === 0) {
        resolve(response);
      }
    }

    for (const rule in rules) {
      counter++;
      mc.send(`gamerule ${rule} ${rules[rule]}`).then(onResponse).catch(onResponse);
    }
  });
}

function setblock (block, [x, y, z], mode) {
  let result = `setblock ${x} ${y} ${z} ${block}`;

  if (mode) {
    result += ' ' + mode;
  }

  return result;
}

function fill (block, [x0, y0, z0], [x1, y1, z1], mode) {
  let result = `fill ${x0} ${y0} ${z0} ${x1} ${y1} ${z1} ${block}`;

  if (mode) {
    result += ' ' + mode;
  }

  return result;
}

function getCoord (coord) {
  const result = {
    relative: false,
    value: 0
  };

  if (typeof coord === 'string') {
    if (coord[0] === '~') {
      result.relative = true;
      result.value = parseFloat(coord.substr(1) || 0);
    } else {
      result.value = parseFloat(coord);
    }
  } else {
    result.value = coord;
  }

  return result;
}

function Coords (coords) {
  if (typeof coords === 'string') {
    coords = coords.split(' ');
  }

  this.x = getCoord(coords[0]);
  this.y = getCoord(coords[1]);
  this.z = getCoord(coords[2]);
}
Coords.prototype.apply = function (coords) {
  if (typeof coords === 'string') {
    coords = coords.split(' ');
  }

  this.x.value = getCoord(coords[0]).value;
  this.y.value = getCoord(coords[1]).value;
  this.z.value = getCoord(coords[2]).value;
}
Coords.prototype.toString = function () {
  return [
    (this.x.relative ? '~' : '') + this.x.value.toString(),
    (this.Y.relative ? '~' : '') + this.y.value.toString(),
    (this.z.relative ? '~' : '') + this.z.value.toString()
  ];
}
Coords.prototype.getRelative = function ([dx, dy, dz]) {
  return [
    (this.x.relative ? '~' : '') + (this.x.value + dx),
    (this.y.relative ? '~' : '') + (this.y.value + dy),
    (this.z.relative ? '~' : '') + (this.z.value + dz)
  ]
}


module.exports = {
  gamerule,
  setblock,
  fill,
  Coords
};
