
var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');

var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var ConvertIds          = rootRequire('models/plugins/ConvertIds');
var mongoose_connection = rootRequire('connections/mongoose');
var Organisation        = rootRequire('models/organisation');

var completionTypes = ['callback', 'statement'];
var trackByTypes    = ['actor', 'person'];

var waypointSchema = new mongoose.Schema({
    description   : { type: String }
  , conditions    : { type: String }
  , count         : { type: Number, default: 1, min: 1 } 
  , order         : { type: Number }
});
waypointSchema.plugin(SaveClientId);
waypointSchema.plugin(ConvertIds);

// TODO, add statements to the completion options
var outcomeSchema = new mongoose.Schema({
    description   : { type: String }
  , isActive      : { type: Boolean, default: true }
  , type          : { type: String, enum: completionTypes }
  , callback      : { type: String }
});
outcomeSchema.plugin(SaveClientId);
outcomeSchema.plugin(ConvertIds);

var journeySchema = new mongoose.Schema({
    description   : { type: String }
  , organisation  : { type: mongoose.Schema.ObjectId, ref : 'Organisation', index: true }
  , waypoints     : { type: [waypointSchema] }
  , outcomes      : { type: [outcomeSchema] }
  , isSequential  : { type: Boolean, default: false }
  , trackBy       : { type: String, enum: trackByTypes }
});
journeySchema.plugin(SaveClientId);

journeySchema.statics.filterByClient = function(client, cb) {
  var self = this;
  if( _.includes(client.scopes, 'all') ) {
    Organisation.limitIdsByOrg([client.organisation], [client.organisation], 0, function(orgIds) {
      cb( Journey.find({organisation: { $in: orgIds }}) );
    })
  } else {
    cb( Journey.find({_id: null}) );
  }
}

module.exports = Journey = mongoose_connection.getConnection().model( 'Journey', journeySchema, 'journeys' );
/*{
    description: "testing journey",
    lrs: ObjectId('55897378e51088b814000029'),
    waypoints: [
      {
        _id: ObjectId(),
        conditions: '{"voided":false, "statement.verb.id":"http://activitystrea.ms/schema/1.0/access"}',
        order: 0,
        count: 1
      },
      {
        _id: ObjectId(),
        conditions: '{"voided":false, "statement.verb.id":"http://adlnet.gov/expapi/verbs/commented"}',
        order: 1,
        count: 5
      }
    ],
    outcomes: [
      {
        _id: ObjectId(),
        type: 'callback',
        callback: 'http://localhost/learninglocker/public/dump'
      }
    ],
    isSequential: false,
    trackBy: 'actor'
  }*/