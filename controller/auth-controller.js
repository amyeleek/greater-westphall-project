'use strict';

const debug = require('debug')('authdemo: auth-controller');
const httpErrors = require('http-errors');
const User = require('../model/user');
debug('auth-controller');

exports.signup = function(reqBody){
  debug('signup');
  return new Promise((resolve, reject) => {
    let password = reqBody.password;
    delete reqBody.password;
    let user = new User(reqBody);

    user.generateHash(password)//first hash the password
    .then( user => user.save())//save the user t make sure unique username
    .then( user => user.generateToken())//create token to send to the user
    .then( token => resolve(token))//resolve token
    .catach( err => reject(httpErrors(400, err.message)));
    // .catch(reject);
  });
};

exports.signin = function(auth){
  debug('signin');
  return new Promise((resolve, reject) => {
    User.findOne({username: auth.username})
    .then( user => {
      if(!user) return reject(httpErrors(401, 'no user found'));
      return user;
    })
    .then( user => user.compareHash(auth.password))
    .then( user => user.generateToken())
    .then( token => resolve(token))
    .catch( err => reject(httpErrors(401, err.message)));
    // .catch(reject);
  });
};
