var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');
var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var mongoose_connection = rootRequire('connections/mongoose');
var Organisation        = rootRequire('models/organisation');

var schema = new mongoose.Schema({
    name           : { type: String }
  , email          : { type: String }
  , password       : { type: String }
  , organisation   : { type: mongoose.Schema.ObjectId, ref : 'Organisation', index: true }
  , client         : { type: mongoose.Schema.ObjectId, ref : 'Client' }
  , role           : { type: String, default: 'super' }
  , settings       : { 
    CONFIRM_BEFORE_DELETE: { type: Boolean, default: true }
  }
});

schema.statics.filterByClient = function(client) {
  const scopes = client.scopes;
  
  if( _.includes(scopes, 'all') ) {
    return this;
  }
  return this.find({_id: null});
}

schema.statics.filterByClient = function(client, cb) {
  var self = this;
  if( _.includes(client.scopes, 'all') ) {
    // only show models belonging to LRSs in the client's org
    Organisation.findById(client.organisation, function(err, org){
      assert.ifError(err); assert(org);
      var orgIds = _.union( [org._id], org.suborgs );
      cb( self.find({ organisation: { $in: orgIds} }) );
    })
  } else {
    cb( self.find({_id: null}) );
  }
}

schema.plugin(SaveClientId);

module.exports = User = mongoose_connection.getConnection().model( 'User', schema, 'users'); 

/*
user connects to site
do they have a session?
no -> redirect to LL_Node login page
      User enters details or signs in with oauth via a separate provider (salesforce, linkedin)
      
      authenticate their api client via ouath with the node server
      return with access token
      add token to session
yes -> they have a session and a token, access the site

token expired? pop up window asking for creds to reconnect, post to node oauth api
return with access token

clients can be shared between users. Super users will be given the super admin client
*/

/*
db.users.update({_id: ObjectId("52950dc7a70a823733232df9")}, {
  "_id" : ObjectId("52950dc7a70a823733232df9"),
  "created_at" : ISODate("2013-11-26T21:08:23.998Z"),
  "email" : "ben@ht2.co.uk",
  "name" : "Ben Betts",
  "password" : "$2y$10$h6UkjYXwqmMKjUIfoc7qae236VwI2VPBp.g5OZG014uDwAtx.jFje",
  "remember_token" : "RshJEuqXCZGxIXxSuV5EZIhzPyjoZk9RLBYqvd7qPvVdKkVYtsiSPoMMmV5m",
  "role" : "super",
  "updated_at" : ISODate("2015-08-28T09:09:55Z"),
  client: ObjectId("549180d466562ff709930cf4"),
  "verified" : "yes",
  "settings"       : { 
    "CONFIRM_BEFORE_DELETE": true
  }
})*/