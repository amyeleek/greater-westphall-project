'use strict';

const mongoose = require('mongoose');
const itemSchema = mongoose.Schema({
  name: { type: String, required: true },
  permission: { type: Boolean, required: true },
  records: { type: String, required: true }
});

module.exports = mongoose.model('item', itemSchema);
