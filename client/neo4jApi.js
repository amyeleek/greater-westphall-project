(function(module){

  function checkExists(nodes, item){
   return nodes.map(function(e) { 
     return e.properties.name; 
   }).indexOf(item.properties.name);
  }

 var api = {};

 var neo4j = window.neo4j.v1;
 var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "fukkinnerds"));

 //returns information about one node, and just that node
 //currently not used, but keeping it around just in case
 api.getNode = function(name) {
  var session = driver.session();
  //set id based on what type is
  //var id = ((type == "Media") ? "title" : "name");
  return session
    .run("MATCH (node) \
      WHERE node.name=~ {name} \
      RETURN node", {name: '(?i).*' + name + '.*'}
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
api.getNodeNeighbors = function(name) {
  var session = driver.session();
  return session
    .run("MATCH (node)-[:APPEARS_IN]-(neighbors) \
          WHERE node.name =~ {name} \
          RETURN node, collect(DISTINCT neighbors) as neighbors", {name: '.*' + name + '.*'})
    .then(result => {
      session.close();

      if (result.records.length == 0)
        return null;

      var record = result.records[0];

      //similar to, but distinct from the stuff in getGraph
      //yeah, this needs to be cleaned up
      var nodes = [], rels = [], i = 0, target = 0, source = 0;

      var insert =  new Node(record.get('node')); 

      nodes.push(insert);
      source = i;
      i++;


      var neighbors = record.get('neighbors');
      neighbors.forEach(nNode =>{
        var neighbor = new Node(nNode); 

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

//I'm not sure if only looking up by name will have HORRIBLE CONSEQUENCES later or not
//it probably will
api.getShortestPath = function(name1, name2){
  var session = driver.session();
  return session
  .run("MATCH p=shortestPath((a)-[r*]-(b)) \
              WHERE a.name = {name1} AND b.name = {name2} \
              RETURN p", {name1: name1, name2: name2}
  )
  .then(result => {
    session.close();
    
    var record = result.records[0]._fields[0].segments;

    var nodes = [], rels = [], i = 0, target = 0, source = 0;

    //if the first one is a character, look up their originating media
    //this will probably lead to problems but we'll cross that bridge when we come to it
    if(record[0].start.properties.origin){
      nodes.push({
                    properties:{
                                  name: record[0].start.properties.origin, 
                                  type: "Media"
                                },
                    labels: []
                  });
      rels.push({source: 0, target: 1});
      i++;
    }

    record.forEach(res => {
        var insertStart = new Node(res.start), 
            insertEnd = new Node(res.end),
            existsStart = checkExists(nodes, insertStart);
            existsEnd = checkExists(nodes, insertEnd);

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
        var insert = new Node(res.get('node')),
            existsNode = checkExists(nodes, insert),
            media = new Node(res.get('mode')),
            existsMedia = checkExists(nodes, media)

        if (existsNode == -1) {
          nodes.push(insert);
          target = i;
          i++;
        }else{
          target = existsNode;
        }

        if (existsMedia == -1) {
          nodes.push(media);
          source = i;
          i++;
        }else{
          source = existsMedia;
        }

        rels.push({source, target})
      });

      return {nodes, links: rels};
    });
}

//want to only create nodes with a connection
//split up to creating nodes and relationships

//on the frontend, only allow creation after clicking on a node and automatically filling in the first rel
api.createNode = function(type, name, nodeArgs){
  if(type === 'Media') { 
    createMediaNode(name, nodeArgs);
  }else{
    createCharacterNode(name, nodeArgs);
  }
}

//might have to create more nodes to have relationships
//on frontend, check if each name is already in db through getNode? (might be costly)
//first check if we already have something on the graph, since fullGraph should run on startup
//cache everything on fullGraph, check if those names are in when someone enters
//if no, open a required thing to input other data, make those new nodes
api.createRelationships = function(type, name, rels){

  //directions always go (character) -> (canon), which we show here
  var direction = ((type === "Media") ? ["<", ""] : ["", ">"]);

  rels.forEach(rel => {
    var session = driver.session();

    session.run(
      "MATCH (a), (b) \
      WHERE a.name = {name1} and b.name = {name2} \
      CREATE (a)" + direction[0] + "-[:APPEARS_IN]-" + direction[1] + "(b)",
      {name1: name, name2: rel})
    .then(results => {
      session.close();
      console.log(results);
    })
  });

}

function createMediaNode(name, args){
  var session = driver.session();
  return session.run(
    "CREATE (node:Media {name: {name}, type: {type}, released: {date}})",
    {name: name, type: args.type, date: args.date})
  .then(results => {
    session.close();
  })
}

function createCharacterNode(name, args){
  var session = driver.session();
  return session.run(
    "CREATE (node:Character {name: {name}, origin: {origin}})",
    {name: name, origin: args.origin})
  .then(results => {
    session.close();
  })
}

api.deleteNode = function(name){
  var session = driver.session();
  return session
  .run("MATCH (a)-[r]-(b) \
              WHERE a.name = {name} \
              DELETE a, r ", {name: name}
  ).then(results => {
    session.close();
  });
}

//delete the relationship between two nodes
api.deleteRelationship = function(name1, name2){
  var session = driver.session();
  return session
  .run("MATCH (a)-[r]-(b) \
              WHERE a.name = {name1} AND b.name = {name2} \
              DELETE r ", {name1: name1, name2: name2}
  ).then(results => {
    session.close();
  });
}

module.api = api;

})(window)