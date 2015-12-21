var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');
var timestamps          = require('mongoose-timestamp');

var moduleSchema = new mongoose.Schema({
    MOD_ID            : { type: String }
  , CREDITS           : { type: Number }
  , MOD_NAME          : { type: String }
  , INSTANCES         : [{ type: mongoose.Schema.ObjectId, ref : 'ModuleInstance' }]
});
moduleSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'Module', moduleSchema, 'modules'); 