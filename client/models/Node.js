//Yes, I know. It represents a node in the database. 
function Node(node) {

  Object.keys(node.properties).forEach(function(k){
 	  this[k] = node.properties[k];
	},this);

  if (this.id) {
    this.id = this.id.toNumber();
  }
}