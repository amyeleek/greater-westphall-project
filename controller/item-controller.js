'use strict';

const debug = require('debug')('authdemo: item-controller');
const Item = require('../model/item');
const httpErrors = require('http-errors');

debug('item-controller');

exports.createItem = function(itemData){
  debug('createItem');
  return new Promise((resolve, reject) => {

    new Item(itemData).save()
    .then( item => resolve(item))
    .catch( err => reject(httpErrors(400, err.message)));
  });
};

exports.removeAllItems = function(){
  debug('removeAllItems');
  return Item.remove({});
};

exports.fetchItemById = function(itemId){
  debug('fetchItemById');

  return new Promise((resolve, reject) => {
    Item.findOne({_id: itemId})
    .then( item => resolve(item))
    .catch( err => reject(httpErrors(400, err.message)));
  });
};

exports.deleteItem = function(itemId){
  debug('deleteItem');

  return new Promise((resolve, reject) => {
    Item.findByIdAndRemoveAndRemove({_id: itemId})
    .then( item => resolve(item))
    .catch( err => reject(httpErrors(400, err.message)));
  });
};

exports.updateItem = function(itemId, reqBody){
  debug('updateItem');
  return new Promise((resolve, reject) => {

    Item.findByIdAndUpdate(itemId, reqBody)
    .then(() => Item.findOne({_id:itemId}))
    .then( item => resolve(item))
    .catch( err => reject(httpErrors(400, err.message)));
  });
};
