var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');
var async               = require('async');
var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var mongoose_connection = rootRequire('connections/mongoose');
var logger        = rootRequire('core/logger');

var Organisation;

var schema = new mongoose.Schema({
  name           : { type: String },
  logoPath       : { type: String },
  parent         : { type: mongoose.Schema.ObjectId, ref : 'Organisation' },
  lrss           : { type: [ mongoose.Schema.ObjectId ], ref : 'Lrs' }
});

/**
 * Returns an array of org ids that the given client can view limited to the level 
 * @param  {Object}   orgIds ids to start with
 * @param  {Object}   totalIds ids found so far
 * @param  {Number}   level  How many levels deep to look for children - default 1 (you can see your org and its direct suborgs)
 * @param  {Function} cb     Callback to be called with the result
 */
schema.statics.limitIdsByOrg = function limitIdsByOrg (stepIds, cumulativeIds, level, cb) {  
  level = level || 0
  if(level > 0)
    Organisation.find({parent: { $in: stepIds }}, function(err, orgs){
      const childIds = _.pluck(orgs, '_id');
      Organisation.limitIdsByOrg( childIds, _.union(childIds, cumulativeIds), level-1, cb)
    });
  else
    cb(cumulativeIds);
}

schema.statics.filterByClient = function(client, cb) {
  if( _.includes(client.scopes, 'all') ) {
    Organisation.limitIdsByOrg([client.organisation], [client.organisation], 1, function(orgIds) {
      cb( Organisation.find({_id: { $in: orgIds }}) );
    })
  } else {
    cb( Organisation.find({_id: null}) );
  }
}

schema.plugin(SaveClientId);

module.exports = Organisation = mongoose_connection.getConnection().model( 'Organisation', schema, 'organisations');