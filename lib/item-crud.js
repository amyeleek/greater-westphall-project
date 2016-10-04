'use strict';

const Item = require('../model/item');

exports.createItem = function(reqBody){
  const item = new Item(reqBody);
  console.log('item', item);
};
