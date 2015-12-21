var mongoose            = require('mongoose');
var moment              = require('moment');
var timestamps          = require('mongoose-timestamp');
var mongoose_connection = rootRequire('connections/mongoose');

var gradeSchema = new mongoose.Schema({
    MODULE_INSTANCE      : { type: mongoose.Schema.Types.ObjectId, ref : 'ModuleInstance' }
  , STUDENT              : { type: mongoose.Schema.Types.ObjectId, ref : 'Student' }
  , GRADEABLE_OBJECT     : { type: String }
  , CATEGORY             : { type: Number }
  , MAX_POINTS           : { type: Number }
  , EARNED_POINTS        : { type: Number }
  , WEIGHT               : { type: Number }
  , GRADE_DATE           : { type: Date }
});
gradeSchema.plugin(timestamps);

module.exports = mongoose_connection.getConnection().model( 'Grade', gradeSchema, 'grades' );