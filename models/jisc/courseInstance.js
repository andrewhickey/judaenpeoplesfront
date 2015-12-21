var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');
var timestamps          = require('mongoose-timestamp');

var courseInstanceSchema = new mongoose.Schema({
    COURSE_INSTANCE_ID : { type: String }
  , ACADEMIC_YEAR      : { type: String }
  , sys_modroot        : { type: String }
  , START_DATE         : { type: Date }
  , END_DATE           : { type: Date }
  , COURSE             : { type: mongoose.Schema.ObjectId, ref : 'Course' },
});
courseInstanceSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'CourseInstance', courseInstanceSchema, 'courseInstances'); 