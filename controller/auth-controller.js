'use strict';

const debug = require('debug')('authdemo:auth-controller');
const httpErrors = require('htp-errors');

const User = require('../model/user');

debug('auth-controller');

exports.signup = function(reqBody){
  debug('signup');
  return new Promise((resolve, reject) => {
    let password = reqBody.password;
    let user = new User(reqBody);
    delete reqBody.password;

    user.generateHash(password)
    .then( user => user.save())
    .then( user => user.generateToken())
    .then( token => resolve(token))
    .catach( err => reject(httpErrors(400, err.message)));
  });
};

exports.signin = function(auth){
  debug('signin');
  return new Promise((resolve, reject) => {
    User.findOne({username: auth.username})
    .then( user => user.compareHash(auth.password))
    .then( user => user.generateToken())
    .then( token => resolve(token))
    .catch( err => reject(httpErrors(401, err.message)));
  });
};
