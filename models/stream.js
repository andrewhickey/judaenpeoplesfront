var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');
var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var ConvertIds          = rootRequire('models/plugins/ConvertIds');

var mongoose_connection = rootRequire('connections/mongoose');
var Organisation        = rootRequire('models/organisation');
var LRS                 = rootRequire('models/lrs');

var outcomeSchema = new mongoose.Schema({
    description   : { type: String }
  , isActive      : { type: Boolean, default: true }  
  , callback      : { type: String }
  , type          : { type: String }
});
outcomeSchema.plugin(SaveClientId);
outcomeSchema.plugin(ConvertIds)

var schema = new mongoose.Schema({
    organisation  : { type: mongoose.Schema.ObjectId, ref : 'Organisation', index: true }
  , hash          : { type: String }
  , description   : { type: String }
  , outcomes      : { type: [outcomeSchema] }
  , conditions    : { type: String }
});
schema.plugin(SaveClientId);

schema.statics.filterByClient = function(client, cb) {
  var self = this;
  if( _.includes(client.scopes, 'all') ) {
    // only show models belonging to LRSs in the client's org
    Organisation.findById(client.organisation, function(err, org){
      assert.ifError(err);
      var orgIds = _.union( [org._id], org.suborgs );
      LRS.find({organisation: { $in: orgIds}}, function(err, lrss){
        assert.ifError(err);
        var lrsIds = _.pluck(lrss, '_id');
        cb( self.find({ lrs: { $in: lrsIds} }) );
      });
    })
  } else {
    cb( self.find({_id: null}) );
  }
}


module.exports = Stream = mongoose_connection.getConnection().model( 'Stream', schema, 'streams' );