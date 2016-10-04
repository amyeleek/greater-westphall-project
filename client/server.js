var requestProxy = require('express-request-proxy'),
express = require('express'),
port = process.env.PORT || 8080,
app = express();

app.use(express.static('./'));

app.get('*', function(request, response) {
	response.sendFile('index.html', { root: '.' });
});

app.listen(port, function() {
	console.log('Server started on port ' + port + '!');
});