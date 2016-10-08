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

/* 
  Need to refrence later characters back to media
  Look up what each character's mode is
  That goes in the rels array
  Mode should have a number asociated with them? 

  Every new node, look up the mode associated with it
  Find that mode in the array
  Push that to the rels array (node, mode's position in array)

*/
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
      console.log(nodes);
      console.log(rels);

      return {nodes, links: rels};
    });
}

module.api = api;

})(window)