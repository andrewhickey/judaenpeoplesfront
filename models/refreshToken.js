var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
  
  refreshToken    : { type: String },
  expirationDate  : { type: Date },
  user            : { type: mongoose.Schema.ObjectId, ref : 'User' },
  client          : { type: mongoose.Schema.ObjectId, ref : 'Client' },

}, { strict: false });

module.exports = mongoose_connection.getConnection().model( 'RefreshToken', schema, 'refreshToken'); 