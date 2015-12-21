
var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');
var timestamps          = require('mongoose-timestamp');

var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var ConvertIds          = rootRequire('models/plugins/ConvertIds');
var mongoose_connection = rootRequire('connections/mongoose');
var Organisation        = rootRequire('models/organisation');

var visualisationSchema = new mongoose.Schema({
    description   : { type: String }
  , type          : { type: String }
  , match         : { type: String }
  , sources       : [{ type: mongoose.Schema.Types.ObjectId, ref : 'Lrs' }]
  , organisation  : { type: mongoose.Schema.Types.ObjectId, ref : 'Organisation', index: true }
  , owner         : { type: mongoose.Schema.Types.ObjectId, ref : 'User', index: true }
});

visualisationSchema.plugin(SaveClientId);
visualisationSchema.plugin(timestamps);

visualisationSchema.statics.filterByClient = function(client, cb) {
  var self = this;
  if( _.includes(client.scopes, 'all') ) {
    Organisation.limitIdsByOrg([client.organisation], [client.organisation], 0, function(orgIds) {
      cb( Visualisation.find({organisation: { $in: orgIds }}) );
    })
  } else {
    cb( Visualisation.find({_id: null}) );
  }
}

module.exports = Visualisation = mongoose_connection.getConnection().model( 'Visualisation', visualisationSchema, 'visualisations' );