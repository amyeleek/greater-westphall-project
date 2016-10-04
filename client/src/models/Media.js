function Media(node) {
  //_.extend(this, _node.properties);

  Object.keys(node.properties).forEach(function(k){
 	  this[k] = node.properties[k];
	},this);

  if (this.id) {
    this.id = this.id.toNumber();
  }
}

module.exports = Media;