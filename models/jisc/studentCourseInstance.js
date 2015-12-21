var mongoose            = require('mongoose');
var timestamps          = require('mongoose-timestamp');
var mongoose_connection = rootRequire('connections/mongoose');

var studentCourseInstanceSchema = new mongoose.Schema({
    COURSE_INSTANCE      : { type: mongoose.Schema.ObjectId, ref : 'CourseInstance' }
  , STUDENT              : { type: mongoose.Schema.ObjectId, ref : 'Student' }
  , STATUS               : { type: Number }
  , YEAR_PRG             : { type: Number }
  , YEAR_STU             : { type: Number }
  , WITHDRAWAL_DATE      : { type: Date }
  , WITHDRAWAL_REASON    : { type: Number }
  , ENTRY_QUALS          : { type: String }
  , UCAS_POINTS          : { type: Number }
});
studentCourseInstanceSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'StudentCourseInstance', studentCourseInstanceSchema, 'studentsCourseInstances' );