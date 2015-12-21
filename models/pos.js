var _                   = require('lodash');
var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
  tag            : { type: String },
  averageCount   : { type: Number },
  words          : [{ 
    word: { type: String },
    count: { type: Number },
    length: { type: Number }
  }]
});

schema.statics.random = function(query, cb) {
  
  // get the number of possible matches
  POS.aggregate([
    { $unwind: '$words' },
    { $match: query},
    { $group: { _id: null, count: { $sum: 1 } } }
  ], function(err, res){
    // use skip to get a random item
    var count = _.get(res, '[0].count', 0);
    var skip = Math.floor(Math.random() * count);
    POS.aggregate([
      { $unwind: '$words' },
      { $match: query },
      { $skip: skip },
      { $limit: 1 },
      { $project: {
        "words": 1
      }}
    ], function(err, res){
      cb(err, _.get(res, '[0].words', {}))
    });
  })
}

module.exports = POS = mongoose_connection.getConnection().model( 'POS', schema, 'pos'); 