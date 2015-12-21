var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
  text           : { type: String }
}, { strict: false });

module.exports = mongoose_connection.getConnection().model( 'Data_v1', schema, 'data_v1'); 