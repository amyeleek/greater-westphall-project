'use strict';

const Router = require('express').Router;
const debug = require('debug')('authdemo:auth-router');
const jsonParser = require('body-parser');

const authController = require('../controller/auth-controller');
const authRouter = module.exports = new Router();

authRouter.post('/signup', jsonParser, function(req, res, next){
  debug('auth-router');
  authController.signup(req.body)
  .then( token => res.send(token))
  .catch(next);
});
