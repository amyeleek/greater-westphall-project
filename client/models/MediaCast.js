function MediaCast(title, chars) {
  //_.extend(this, _node.properties);

  this.title = title

  this.chars = chars.map(function (c) {
      return {
        name: c[0],
        origin: c[1]
      }
    });

  if (this.id) {
    this.id = this.id.toNumber();
  }
}