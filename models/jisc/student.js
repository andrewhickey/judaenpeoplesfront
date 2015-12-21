var mongoose            = require('mongoose');
var moment              = require('moment');
var timestamps          = require('mongoose-timestamp');
var mongoose_connection = rootRequire('connections/mongoose');

var studentSchema = new mongoose.Schema({
    STUDENT_ID              : { type: String, unique : true, required : true, dropDups: true }
  , COURSE_INSTANCES        : [{ type: mongoose.Schema.Types.ObjectId, ref : 'StudentCourseInstance' }]
  , MODULE_INSTANCES        : [{ type: mongoose.Schema.Types.ObjectId, ref : 'StudentModuleInstance' }]
  , GRADES                  : [{ type: mongoose.Schema.Types.ObjectId, ref : 'Grade' }]
  , MOBILE_PHONE            : { type: String }
  , HOME_PHONE              : { type: String }
  , FIRST_NAME              : { type: String }
  , LAST_NAME               : { type: String }
  , COACH_SCHOOL_ID         : { type: String }
  , DOB                     : { type: Date }
  , PARENTS_ED              : { type: String }
  , DOMICILE                : { type: String }
  , ETHNICITY               : { type: Number }
  , TERMTIME_ACCOM          : { type: Number }
  , SOCIO_EC                : { type: Number }
  , LEARN_DIFF              : { type: String }
  , POSTCODE                : { type: String }
  , GENDER                  : { type: Number }
  , PRIMARY_EMAIL           : { type: String }
  , OVERSEAS                : { type: Number }
  , PHOTO_URL               : { type: String }
  , ADDRESS_LINE_1          : { type: String }
  , ADDRESS_LINE_2          : { type: String }
  , ADDRESS_LINE_3          : { type: String }
  , CREATED_AT              : { type: String }
  , UPDATED_AT              : { type: String }
});
studentSchema.plugin(timestamps);

studentSchema.virtual('age').get(function () {
  return moment().diff(this.DOB, 'years');
});

studentSchema.set('toObject', { virtuals: true });
studentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose_connection.getConnection().model( 'Student', studentSchema, 'students' );