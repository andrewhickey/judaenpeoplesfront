var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');
var timestamps          = require('mongoose-timestamp');

var moduleInstanceSchema = new mongoose.Schema({
    MOD_INSTANCE_ID           : { type: String }
  , ACADEMIC_YEAR             : { type: String }
  , LEVEL                     : { type: Number }
  , PERIOD                    : { type: Number }
  , MOD_ENDDATE               : { type: Date }
  , MOD_STARTDATE             : { type: Date }
  , sys_assess_complete       : { type: Number }
  , sys_assigncount           : { type: Number }
  , sys_assessed              : { type: Number }
  , OPTIONAL                  : { type: Number }
  , MODULE                    : { type: mongoose.Schema.ObjectId, ref : 'Module' }
});
moduleInstanceSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'ModuleInstance', moduleInstanceSchema, 'moduleInstances'); 