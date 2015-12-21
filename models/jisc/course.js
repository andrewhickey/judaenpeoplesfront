var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');
var timestamps          = require('mongoose-timestamp');

var courseSchema = new mongoose.Schema({
    COURSE_ID         : { type: String }
  , SUBJECT           : { type: String }
  , TITLE             : { type: String }
  , sys_modroot       : { type: String }
  , INSTANCES         : [{ type: mongoose.Schema.ObjectId, ref : 'CourseInstance' }]
});
courseSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'Course', courseSchema, 'courses'); 