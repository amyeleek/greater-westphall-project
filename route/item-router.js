'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const itemRouter = module.exports = new Router();
const itemCrud = require('../lib/item-crud');
const debug = require('debug')('authdemo:item-router');

itemRouter.post('/item', unction(req, res){
  itemCrud.createItem(req.Body)
  .then( item => res.send(item))
  .catch( err => res.sendError(err));
});

itemRouter.get('/item/:id', function(req, res){
  itemCrud.fetchItem(req.params.id)
  .then(item => res.send(item))
  .catch( err => res.sendError(err));
});
