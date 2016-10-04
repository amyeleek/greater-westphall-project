(function(module){
 var api = {};

 var neo4j = window.neo4j.v1;
 var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "fukkinnerds"));

 api.searchMedia = function(type, queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (media:Game) \
      WHERE media.title =~ {title} \
      RETURN media',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Media(record.get('media'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

//this pisses me off
//curry function? Yeah, probably eventually
 api.searchLink = function(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (char:Character) \
      WHERE char.name =~ {name} \
      RETURN char',
      {title: '(?i).*' + queryString + '.*'}
    )
    .then(result => {
      session.close();
      return result.records.map(record => {
        return new Media(record.get('char'));
      });
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

module.api = api;

})(window)