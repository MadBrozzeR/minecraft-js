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

function setblock (block, coords, mode) {
  let result = `setblock ${new Coords(coords)} ${block}`;

  if (mode) {
    result += ' ' + mode;
  }

  return result;
}

function fill (block, coords0, coords1, mode) {
  let result = `fill ${new Coords(coords0)} ${new Coords(coords1)} ${block}`;

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
    (this.x.relative ? '~' : '') + (this.x.value ? this.x.value.toString() : ''),
    (this.y.relative ? '~' : '') + (this.y.value ? this.y.value.toString() : ''),
    (this.z.relative ? '~' : '') + (this.z.value ? this.z.value.toString() : '')
  ].join(' ');
}
Coords.prototype.getRelative = function (dx, dy, dz) {
  const x = this.x.value + dx;
  const y = this.y.value + dy;
  const z = this.z.value + dz;

  return [
    (this.x.relative ? '~' : '') + (x || ''),
    (this.y.relative ? '~' : '') + (y || ''),
    (this.z.relative ? '~' : '') + (z || '')
  ].join(' ');
}

function summon (entity, position) {
  return `summon ${entity.name} ${new Coords(position)} ${entity.serializeData()}`
}

module.exports = {
  gamerule,
  setblock,
  fill,
  Coords
};
