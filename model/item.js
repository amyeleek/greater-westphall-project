'use strict';

const mongoose = require('mongoose');
// const debug = require('debug')('authdemo:item');
const itemSchema = mongoose.Schema({
  // date: { type: Date, required: true },
  name: { type: String, required: true },
  permission: { type: Boolean, required: true },
  records: { type: Array, required: true },
  userId: { type: mongoose.Schema.ObjectId, required: true }
});

const Item = module.exports = mongoose.model('item', itemSchema);
//do some validation that the records have to be filled!
Item.schema.path('records').validate(function(value){
  if (value.length < 1) return false;
  return true;
});
