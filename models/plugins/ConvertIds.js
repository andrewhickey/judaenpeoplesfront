var ObjectID    = require('mongodb').ObjectID;
var mongoose    = require('mongoose');

var _           = require('lodash');

module.exports = exports = function saveClientId (schema, options) {

  schema.pre('validate', function(next, done) {
    this._id = this._id || new ObjectID();
    next();
  });

}