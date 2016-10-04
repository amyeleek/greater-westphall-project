require('./assets/css/compiled/base.css');

var api = require('./neo4jApi');

function searchMedia(type, queryString){
	api.searchDB(type, queryString);
}