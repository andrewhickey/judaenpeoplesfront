var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
  tag            : { type: String },
  words          : [{ 
    word: { type: String },
    count: { type: Number },
  }]
});

module.exports = mongoose_connection.getConnection().model( 'POS', schema, 'pos'); 