function serialize (value) {
  switch (typeof value) {
    case 'boolean':
      return value ? '1b' : '0b';
    case 'number':
      return (~~value === value) ? value.toString() : (value + 'f');
    case 'string':
      return '"' + value + '"';
    case 'object':
      if (value instanceof Array) {
        let values = '';

        for (let index = 0 ; index < value.length ; ++index) {
          values += (values ? ',' : '') + serialize(value[index]);
        }

        return '[' + values + ']';
      } else {
        let values = '';

        for (const key in value) {
          values += (values ? ',' : '') + key + ':' + serialize(value[key]);
        }

        return '{' + values + '}';
      }
    default:
      return value.toString();
  }
}

function Entity (id) {
  this.id = id;
  this.data = data;
}

Entity.prototype.serializeData = function () {
  return serialize(this.data);
}
