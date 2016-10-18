'use strict';
//npm
const debug = require('debug')('authdemo:item-router');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
//app
const itemController = require('../controller/item-controller');
const parseBearerAuth = require('../lib/parse-bearer-auth');
//module constants
const itemRouter = module.exports = new Router();
// const itemCrud = require('../lib/item-crud');

itemRouter.post('/item', jsonParser, parseBearerAuth, function(req, res, next){
  debug('POST /api/item');
  req.body.userId = req.userId;

  itemController.createItem(req.body)
  .then( item => res.json(item))
  .catch(next);
});

itemRouter.get('/item/:id', function(req, res){
  // itemCrud.fetchItem(req.params.id)
  itemController.fetchItem(req.params.id)
  .then( item => res.send(item))
  .catch( err => res.sendError(err));
});
