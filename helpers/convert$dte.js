var _         = require('lodash');

module.exports = convert$dte = function(value) {
  if(_.has(value, '$dte')) return new Date(_.get(value, '$dte'));
  else if(_.isArray(value)) return _.map(value, convert$dte);
  else if(_.isObject(value)) return _.mapValues(value, convert$dte);
  else return value;
}