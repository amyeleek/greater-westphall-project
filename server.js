'use strict';
//npm modules
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const httpErrors = require('http-errors');
const debug = require('debug')('authdemo:server');

//app modules
const handleError = require('./lib/handle-error');
const parseBearerAuth = require('./lib/parse-bearer-auth');
const authRouter = require('./route/auth-router');
const itemRouter = require('./route/item-router');
// const userRouter = require('./route/user-router');

//constant module variables
const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/authdemodev';

process.env.APP_SECRET = process.env.APP_SECRET || process.env.npm_config_app_secret;
//setup mongo
mongoose.connect(mongoURI);

//setup middleware
app.use(morgan('dev'));
app.use(cors());
//setup routes
app.all('/', parseBearerAuth, function(req, res){
  console.log('req.userId', req.userId);
  res.send('server says: hell-0!');
});
app.use('/api', authRouter);
app.use('/item', itemRouter);

app.all('*', function(req, res, next){
  debug('404 * route');
  next(httpErrors(404, 'no such route'));
});

app.use(handleError);

//start server
const server = app.listen(port, function(){
  debug('server UP <8)))>><|', port);
});

server.isRuning = true;
module.exports = server;
