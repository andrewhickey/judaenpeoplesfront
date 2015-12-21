'use strict';
var mongoose            = require('mongoose');
var assert              = require('assert');
var mongoose_connection = rootRequire('connections/mongoose');
var findOrCreate        = require('mongoose-findorcreate')

var scoringSchemeSchema = new mongoose.Schema({
    lrs_id         : { type: mongoose.Schema.ObjectId, ref : 'Lrs' }
  , targetScore    : { type : Number, default : 5 }
  , keys           : { type : mongoose.Schema.Types.Mixed, default : {
      'xapi_name': 3,
      'xapi_mbox': 5,
      'xapi_home_page': 1.5,
      'xapi_id': 3.5,
      'xapi_mbox_sha1sum': 4
    }}
}, { strict: false });

scoringSchemeSchema.plugin(findOrCreate);

scoringSchemeSchema.statics.filterByClient = function(query,cb) {
  const self = this;
  self.findOne(query, function(err, scoringScheme){
    
    assert.ifError(err);

    if(scoringScheme) cb(null, scoringScheme);
    
    else new self(query).save(function(err, scoringScheme){

      assert.ifError(err);

      cb(null, scoringScheme);

    });

  });
}

module.exports = mongoose_connection.getConnection().model( 'ScoringScheme', scoringSchemeSchema, 'scoringschemes');