'use strict';
//npm modules
const express = require('express');
const morgan = require('morgan');
const httpErrors = require('http-errors');
const debug = require('debug')('authdemo:server');
const mongoose = require('mongoose');
//app modules
// const handleError = require('./lib/handle-error');
// const parserBearerAuth = require('./lib/parse-bearer-auth');
// const authRouter = require('./route/auth-router');
// const userRouter = require('./route/user-router');
//constant module variables
const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost/authdemo';
//setup mongo
mongoose.connect(mongoURI);
//setup middleware
app.use(morgan('dev'));
//setup routes

// app.all('/', parseBearerAuth, function(req, res){
//   console.log('req.userId', req.userId);
//   res.send('HI!');
// });
// app.use('/api', authRouter);
// app.use('/api', userRouter);
//
app.all('*', function(req, res, next){
  debug('404 * route');
  next(httpErrors(404, 'no route found'));
});
//
// app.use(handleError);

//start server
const server = app.listen(port, function(){
  debug('server UP ~<8)))>>< @', port);
});

server.isRuning = true;
module.exports = server;
