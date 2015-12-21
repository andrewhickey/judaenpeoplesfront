var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
  
  token           : { type: String, index: true },
  expirationDate  : { type: Date },
  user            : { type: mongoose.Schema.ObjectId, ref : 'User' },
  client          : { type: mongoose.Schema.ObjectId, ref : 'Client' },
  scopes          : { type: [String] },

}, { strict: false });

module.exports = mongoose_connection.getConnection().model( 'AccessToken', schema, 'accessToken'); 