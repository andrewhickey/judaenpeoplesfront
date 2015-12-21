
var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var institutionSchema = new mongoose.Schema({
    ukprn         : { type: String }
  , inst_name     : { type: String }
  , accesskey     : { type: String }
  , secret        : { type: String }
});

module.exports = mongoose_connection.getConnection().model( 'Institution', institutionSchema, 'institutions' );
