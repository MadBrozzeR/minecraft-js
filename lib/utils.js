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

module.exports = {
  gamerule,
  setblock,
  fill
};
