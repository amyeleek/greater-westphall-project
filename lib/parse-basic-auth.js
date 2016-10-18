'use strict';

const httpErrors = require('http-errors');
const debug = require('debug')('authdemo:parse-basic-auth');

module.exports = function(req, res, next){
  debug('parseBasicAuth');

  var authHeader = req.headers.authorization;
  var namePassword = authHeader.split(' ')[1];
  namePassword = new Buffer(namePassword, 'base64').toString();
  namePassword = namePassword.split(':');
  req.auth = {
    username: namePassword[0],
    password: namePassword[1]
  };
  if (!req.auth.username)
    return next(httpErrors(401, 'no username provided'));
  if (!req.auth.password)
    return next(httpErrors(401, 'no password provided'));
  next();
};
