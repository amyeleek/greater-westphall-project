(function(module){
 var api = {};

 var neo4j = window.neo4j.v1;
 var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "fukkinnerds"));

 //returns information about one node, and just that node
 api.getNode = function(type, queryString) {
  var session = driver.session();
  var id = type == "Media" ? "title" : "name"
  var query = "MATCH (node:"+ type +") \
      WHERE node."+ id + "=~ {id} \
      RETURN node"
  return session
    .run(query, {id: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Node(record.get('node'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}
     
//returns information about a node and its nearest neighbours
api.getNodeNeighbors = function(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (node:Media {title:{title}})-[:APPEARS_IN]-(neighbors) RETURN node, collect(DISTINCT neighbors) as neighbors", {title: title})
    .then(result => {
      session.close();

      if (result.records.length == 0)
        return null;

      var record = result.records[0];

      //similar to, but distinct from the stuff in getGraph
      //yeah, this needs to be cleaned up
      var nodes = [], rels = [], i = 0, target = 0, source = 0;
      var node = record.get('node'); 
      var title = node.properties.name ? node.properties.name : node.properties.title;
      var insert = {title: title, label: node.labels[0]}

      nodes.push(insert);
      source = i;
      i++;


      var neighbors = record.get('neighbors');
      neighbors.forEach(nNode =>{
        var title = nNode.properties.name ? nNode.properties.name : nNode.properties.title;
        var neighbor = {title: title, label: nNode.labels[0]}

        nodes.push(neighbor);
        target = i;
        i++;

        rels.push({source, target})
      });


      return {nodes, links: rels};
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

//will probablhy eventually want a function that grabs a node and a subset of the graph
// 1-5 neighbors, perhaps
//will need to be a combination of getNode and getGraph
//modify getNode

//get EVERYTHING (within limits)
api.getGraph = function() {
  var session = driver.session();
  return session.run(
    //the second node is a mode SHUT UP
    'MATCH (node)-[relate]->(mode) \
     RETURN node,relate,mode \
     LIMIT {limit}', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0, target = 0, source = 0;
      results.records.forEach(res => {
        var node = res.get('node'); 
        var title = node.properties.name ? node.properties.name : node.properties.title;
        var insert = {title: title, label: node.labels[0]}
        var exists = nodes.map(function(e) { return e.title; }).indexOf(insert.title);

        if (exists == -1) {
          nodes.push(insert);
          target = i;
          i++;
        }

        var mode = res.get('mode');
        var media = {title: mode.properties.title, label: mode.labels[0]};
        var source = nodes.map(function(e) { return e.title; }).indexOf(media.title);
        if (source == -1) {
          nodes.push(media);
          source = i;
          i++;
        }

        rels.push({source, target})
      });

      return {nodes, links: rels};
    });
}

module.api = api;

})(window)