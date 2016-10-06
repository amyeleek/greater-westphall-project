(function(module){
 var api = {};

 var neo4j = window.neo4j.v1;
 var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "fukkinnerds"));

 api.searchNode = function(type, queryString) {
  var session = driver.session();
  var id = type == "Game" ? "title" : "name"
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
     
//need to figure out what I want to do with these 
api.getMedia = function(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (media:Game {title:{title}}) \
      OPTIONAL MATCH (media)-[r]-(char:Character) \
      RETURN media.title AS title, \
      collect([char.name, char.origin]) AS chars \
      LIMIT 1", {title})
    .then(result => {
      session.close();

      if (result.records.length == 0)
        return null;

      var record = result.records[0];
      return new MediaCast(record.get('title'), record.get('chars'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

//you get some weird stuff back for this one
//gonna have to think more about how  to make this one work
api.getCharacter = function(name) {
  var session = driver.session();
  return session
    .run(
      "MATCH (n:Character { name: {name} }) \
      -[:APPEARED_IN*1..3]-(neighbors) \
       RETURN n, collect(DISTINCT neighbors)", {name})
    .then(result => {
      session.close();

      if (result.records.length == 0)
        return null;

      var record = result.records[0];
      console.log(result.records);
      console.log(record);
      //return new MediaCast(record.get('title'), record.get('chars'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

// MATCH (m:Game)<-[:APPEARED_IN]-(a:Character) \
//     RETURN m.title AS media, collect(a.name) AS cast \
//     LIMIT {limit}
api.getGraph = function() {
  var session = driver.session();
  return session.run(
    //the second node is a mode SHUT UP
    'MATCH (node)-[relate]->(mode) \
     RETURN node,relate,mode \
     LIMIT {limit}', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        var node = res.get('node'); 
        var title = node.properties.name ? node.properties.name : node.properties.title;
        var insert = {title: title, label: node.labels[0], node: node}
        var exists = nodes.indexOf(insert);
        //this doesn't work and I'm mad
        if (exists == -1) {
          nodes.push(insert);
        }
        var target = i;
        i++;

        // res.get('cast').forEach(name => {
        //   var char = {title: name, label: 'character'};
        //   var source = nodes.indexOf(char);
        //   if (source == -1) {
        //     nodes.push(char);
        //     source = i;
        //     i++;
        //   }
        //   rels.push({source, target})
        // })
      });
      console.log(nodes);

      //return {nodes, links: rels};
    });
}

module.api = api;

})(window)