(function(module){
 var api = {};

 var neo4j = window.neo4j.v1;
 var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "fukkinnerds"));

 //returns information about one node, and just that node
 api.getNode = function(type, queryString) {
  var session = driver.session();
  //set id based on what type is
  //var id = ((type == "Media") ? "title" : "name");
  var query = "MATCH (node:"+ type +") \
      WHERE node.name=~ {id} \
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
//should expand this, really
api.getNodeNeighbors = function(type, name) {
  var session = driver.session();

  var query = "MATCH (node:"+ type +" {name: {name}})-[:APPEARS_IN]-(neighbors) RETURN node, collect(DISTINCT neighbors) as neighbors"

  return session
    .run(query, {name: name})
    .then(result => {
      session.close();

      if (result.records.length == 0)
        return null;

      var record = result.records[0];

      //similar to, but distinct from the stuff in getGraph
      //yeah, this needs to be cleaned up
      var nodes = [], rels = [], i = 0, target = 0, source = 0;
      var node = record.get('node'); 
      var name = node.properties.name;
      var insert = {name: name, label: node.labels[0]}

      nodes.push(insert);
      source = i;
      i++;


      var neighbors = record.get('neighbors');
      neighbors.forEach(nNode =>{
        var neighbor = {name: nNode.properties.name, label: nNode.labels[0]}

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

api.getShortestPath = function(name1, name2){
  var session = driver.session();
  var query = "MATCH p=shortestPath((a)-[r*]-(b)) \
              WHERE a.name = {name1} AND b.name = {name2} \
              RETURN p"
  return session
  .run(query, {name1: name1, name2: name2}
  )
  .then(result => {
    session.close();
    
    var record = result.records[0]._fields[0].segments;

    var nodes = [], rels = [], i = 0, target = 0, source = 0;
    //want to get out the nodes and the links between them 
    record.forEach(res => {
        var insertStart = {name: res.start.properties.name, label: res.start.labels[0]},
            insertEnd = {name: res.end.properties.name, label: res.end.labels[0]},
            //make function?
            existsStart = nodes.map(function(e) { return e.name; }).indexOf(insertStart.name),
            existsEnd = nodes.map(function(e) { return e.name; }).indexOf(insertEnd.name);

        if (existsStart == -1) {
          nodes.push(insertStart);
          source = i;
          i++;
        }else{
          source = target;
        }

        //make this a function?
        if (existsEnd == -1) {
          nodes.push(insertEnd);
          target = i;
          i++;
        }

        rels.push({source, target})

    });

    return {nodes, links: rels};
  })
  .catch(error => {
    session.close();
    throw error;
  });
}

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
        var insert = {name: node.properties.name, label: node.labels[0]}
        var exists = nodes.map(function(e) { return e.name; }).indexOf(insert.name);

        if (exists == -1) {
          nodes.push(insert);
          target = i;
          i++;
        }

        var mode = res.get('mode');
        var media = {name: mode.properties.name, label: mode.labels[0]};
        var source = nodes.map(function(e) { return e.name; }).indexOf(media.name);
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