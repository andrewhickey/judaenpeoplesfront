var mongoose            = require('mongoose');
var _                   = require('lodash');
var assert              = require('assert');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
    lrs           : { type: mongoose.Schema.Types.Mixed }
  , lrs_id        : { type: mongoose.Schema.ObjectId, ref : 'Lrs', index: true }
  , active        : { type: Boolean }
  , voided        : { type: Boolean }
  , timestamp     : { type: Date, index: true }
  , refs          : { type: mongoose.Schema.Types.Mixed } // TODO, find type this should actually be
  , statement     : { type: mongoose.Schema.Types.Mixed, default: {}}
}, { strict: false });

module.exports = Statement = mongoose_connection.getConnection().model( 'Statement', schema, 'statements'); 