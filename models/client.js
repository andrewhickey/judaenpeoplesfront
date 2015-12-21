var mongoose            = require('mongoose');
var _                   = require('lodash');
var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var mongoose_connection = rootRequire('connections/mongoose');
var crypto              = require('crypto');

function getRandString(len) {
  var string = crypto.randomBytes(Math.ceil(len/2))
    .toString('hex') // convert to hexadecimal format
    .slice(0,len);
  return string;
}
var schema = new mongoose.Schema({
  title         : { type: String},
  api           : { 
    basic_key    : { type: String },
    basic_secret : { type: String }
  },
  authority     : {
    name      :   { type: String },
    mbox      :   { type: String }
  },
  isTrusted     : { type: Boolean, default: true },
  organisation  : { type: mongoose.Schema.ObjectId, ref : 'Organisation', index: true },
  lrs_id        : { type: mongoose.Schema.ObjectId, ref : 'Lrs', index: true },
  scopes        : { type: [String] }
});

schema.statics.filterByClient = function(client, cb) {
  cb( this.find({}) );
}

schema.pre('save', function (next) {
  if( !_.get(this.api, 'basic_key') ) _.set(this.api, 'basic_key', getRandString(40));
  if( !_.get(this.api, 'basic_secret') ) _.set(this.api, 'basic_secret', getRandString(40));
  
  if( !_.get(this.authority, 'name') ) _.set(this.authority, 'name', 'New Client');
  if( !_.get(this.authority, 'mbox') ) _.set(this.authority, 'mbox', 'mailto:hello@learninglocker.net');
  
  next();
})

schema.plugin(SaveClientId);

module.exports = mongoose_connection.getConnection().model( 'Client', schema, 'client'); 


/*db.organisations.insert({
  _id: ObjectId("560933129e133d9c1088940c"),
  "name": "HT2"
})

db.client.insert({
  "_id": ObjectId("56093359f26e8f31ec48aad1"),
  "authority" : {
    "name" : 'New Client',
    "mbox" : 'mailto:hello@learninglocker.net'
  },
  "api"           : { 
    "basic_key"    : "ed5f5a7577010352b4fba9600397f7b4d65cd11b",
    "basic_secret" : "cbb83410687c2de89da0412536bc21be98eed3d2"
  },
  "isTrusted" : true,
  "scopes" : [ "all" ],
  "organisation" : ObjectId("560933129e133d9c1088940c") 
})

db.users.update({_id: ObjectId("5609b79f076ed5c625c8bb74")}, {$set: {
  organisation: ObjectId("560933129e133d9c1088940c"),
  client: ObjectId("56093359f26e8f31ec48aad1")
}})

*/