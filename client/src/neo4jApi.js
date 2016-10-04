require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Media = require('./models/Media');
var Link = require('./models/Link');
//var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "fukkinnerds"));

function searchDB(type, queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH (m:{type}) \
      WHERE media.title =~ {title} \
      RETURN media',
      {type: type, title: '(?i).*' + queryString + '.*'}
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

exports.searchDB = searchDB;
//exports.getNode = getNode;
//exports.getGraph = getGraph;
