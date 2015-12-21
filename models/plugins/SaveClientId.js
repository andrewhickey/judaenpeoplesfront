var ObjectID = require('mongodb').ObjectID;

module.exports = exports = function saveClientId (schema, options) {
  schema.add({ clientId: String });  
}