var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');
var util                = require('util');
var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var mongoose_connection = rootRequire('connections/mongoose');
var Organisation        = rootRequire('models/organisation');
var Statement           = rootRequire('models/statement');
var Client              = rootRequire('models/client');
var convert$oid         = rootRequire('helpers/convert$oid');
var convert$dte         = rootRequire('helpers/convert$dte');

var schema = new mongoose.Schema({
    title           : { type: String }
  , description     : { type: String }
  , owner_id        : { type: mongoose.Schema.ObjectId, ref : 'User' } // pointless but has to exist due to auth reqs in php LL
  , organisation    : { type: mongoose.Schema.ObjectId, ref : 'Organisation', index: true }
});

function getLRSFilterFromClient(client, cb) {
  if(client.organisation) {
    // filter by the client's org and suborgs
    Organisation.filterByClient(client, function(query){
      query.exec( function(err, orgs) {
        assert.ifError(err);
        var orgIds = _.pluck( orgs, '_id' );
        cb({ organisation: { $in: orgIds} });
      })
    })
  } else if (client.lrs_id) {
    // filter by lrs id
    cb({_id: client.lrs_id});
  } else {
    // filter everything
    cb({_id: null});
  }
}

schema.pre('save', function(next){
  // make a default client
  if( this.isNew ) {
    var client = new Client({
      lrs_id: this._id, 
      scopes:['all'],
      title: 'Master'
    });
    client.save(function(err, res){assert.ifError(err)});
  }
  next();
})

schema.statics.filterByClient = function filterByClient(client, cb) {
  var self = this;
  if( _.includes(client.scopes, 'all') ) {
    getLRSFilterFromClient(client, function(filter){
      cb( self.find(filter) );
    })
  } else {
    cb( self.find({_id: null}) );
  }
}

schema.statics.appendStatementCount = function(lrsArray, cb) {
  var lrsIds = _.pluck(lrsArray, '_id');
  Statement.aggregate([
    { $match: { lrs_id: { $in:lrsIds } } },
    { $group: { _id: '$lrs_id', count:{$sum:1} } },
  ], function(err, result) {
    // add each 
    _.each(lrsArray, function(lrs){
      lrs.statementCount = _.get(_.find(result, {_id: lrs._id}), 'count', 0);
    })
    cb(lrsArray);
  })
}

/**
 * returns an cursor aggregating the statements collection filtered by the lrss visisble to the authenticated client
 * @param  {Object}   client   authenticating client
 * @param  {Object}   pipeline aggregation pipeline to apply
 * @param  {Function} cb       cb to apply when done
 * @return {Stream}            stream
 */
schema.statics.aggregateStatementsByClient = function(client, pipeline, cb) {
  var self = this;
  if( pipeline ) pipeline = JSON.parse(pipeline);
  pipeline = pipeline || [];
  if( _.includes(client.scopes, 'all') ) {
    self.filterByClient(client, function(lrsQuery){
      lrsQuery.select({_id: 1}).exec(function(err, lrsArray){
        lrsIds = _.pluck(lrsArray, '_id');
        pipeline = _.map(pipeline, convert$oid);
        pipeline = _.map(pipeline, convert$dte);
        pipeline.unshift({$match: { lrs_id: { $in: lrsIds} }});
        stream = Statement.aggregate(pipeline).limit(100).cursor({batchSize: 100}).exec().stream();
        cb(stream);
      })
    })    
  }
}

schema.plugin(SaveClientId);

module.exports = Lrs = mongoose_connection.getConnection().model( 'Lrs', schema, 'lrs'); 