'use strict';

const Item = require('../model/item');
// const AppErr = require('../lib/app-error');
const debug = require('debug')('authdemo: item-crud');

exports.createItem = function(reqBody){
  return new Promise((resolve, reject) => {
    if(!reqBody.name)
      return reject(AppErr.error400('requires name'));
    if(!reqBody.permission)
      return reject(AppErr.error400('requires permission level'));
    if(!reqBody.records)
      return reject(AppErr.error400('requires revious records'));
    reqBody.timestamp = new Date();
    const item = new Item(reqBody);
    item.save()
    .then(resolve)
    .catch(reject);
    resolve(item);
  });
};

exports.fetchItem = function(id){
  return new Promise((resolve, reject) => {
    Item.findOne({_id: id})
    .then(resolve)
    .catch(err => reject(AppErr.error404(err.message)));
  });
};

exports.removeAllItems = function(){
  return Item.remove({});
};
