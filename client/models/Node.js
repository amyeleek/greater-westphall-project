//Yes, I know. It represents a node in the database. 
function Node(node) {

  Object.keys(node).forEach(function(k){
 	  this[k] = node[k];
	},this);

  if (this.id) {
    this.id = this.id.toNumber();
  }
}