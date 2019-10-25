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

module.exports = {
  gamerule
};
