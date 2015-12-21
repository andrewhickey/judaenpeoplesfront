var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
    statement_id : { type: mongoose.Schema.ObjectId, ref : 'Statement' }
  , person_id : { type: mongoose.Schema.ObjectId, ref : 'Person' }
  , score: { type: Number }
}, { strict: false });

module.exports = PersonStatement = mongoose_connection.getConnection().model( 'PersonStatement', schema, 'personstatements'); 