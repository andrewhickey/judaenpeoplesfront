var mongoose            = require('mongoose');
var timestamps          = require('mongoose-timestamp');
var mongoose_connection = rootRequire('connections/mongoose');

var studentModuleInstanceSchema = new mongoose.Schema({
    MODULE_INSTANCE      : { type: mongoose.Schema.ObjectId, ref : 'ModuleInstance' }
  , COURSE_INSTANCE      : { type: mongoose.Schema.ObjectId, ref : 'CourseInstance' }
  , STUDENT              : { type: mongoose.Schema.ObjectId, ref : 'Student' }
  , MOD_OUTCOME          : { type: Number }
  , RETAKE               : { type: Number }
  , FINAL_GRADE          : { type: Number }
  , PASS                 : { type: Number }
});
studentModuleInstanceSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'StudentModuleInstance', studentModuleInstanceSchema, 'studentModuleInstances' );