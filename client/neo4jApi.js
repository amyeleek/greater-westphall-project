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


api.getGraph = function() {
  var session = driver.session();
  return session.run(
    'MATCH (m:Game)<-[:APPEARED_IN]-(a:Character) \
    RETURN m.title AS media, collect(a.name) AS cast \
    LIMIT {limit}', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('media'), label: 'media'});
        var target = i;
        i++;

        res.get('cast').forEach(name => {
          var char = {title: name, label: 'character'};
          var source = nodes.indexOf(char);
          if (source == -1) {
            nodes.push(char);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

module.api = api;

})(window)