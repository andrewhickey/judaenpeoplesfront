var _         = require('lodash');
var mongoose  = require('mongoose');

module.exports = convert$oid = function(value) {
  if(_.has(value, '$oid')){ return mongoose.Types.ObjectId(_.get(value, '$oid')); }
  else if(_.isArray(value)) return _.map(value, convert$oid);
  else if(_.isObject(value)) return _.mapValues(value, convert$oid);
  else return value;
}