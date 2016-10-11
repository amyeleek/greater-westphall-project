function NodeNeighbors(node, neighbors) {
  //_.extend(this, _node.properties);

  this.node = node;

  this.neighbors = neighbors.map(function (c) {
      if(c.labels[0] == "Character"){
        return {
          name: c.properties.name,
          origin: c.properties.origin
        }
      }else{
        return {
          title: c.properties.title,
          type: c.properties.type
        }
      }
    });

  if (this.id) {
    this.id = this.id.toNumber();
  }
}