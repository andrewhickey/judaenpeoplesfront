var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
    student_id : { type: mongoose.Schema.ObjectId, ref : 'Student' }
  , person_id : { type: mongoose.Schema.ObjectId, ref : 'Person' }
  , score: { type: Number }
}, { strict: false });

module.exports = PersonStudent = mongoose_connection.getConnection().model( 'PersonStudent', schema, 'personstudents'); 