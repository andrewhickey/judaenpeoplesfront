var mongoose            = require('mongoose');
var mongoose_connection = rootRequire('connections/mongoose');

var schema = new mongoose.Schema({
    statement     : { type: mongoose.Schema.ObjectId, ref : 'Statement' }
  , journey       : { type: mongoose.Schema.ObjectId, ref : 'Journey' }  
  , waypoint      : { type: mongoose.Schema.ObjectId, ref : 'Journey.waypoints' }
  , person        : { type: mongoose.Schema.ObjectId, ref : 'Person' }
  , agent         : { type: mongoose.Schema.Types.Mixed }
});

module.exports = StatementWaypoint = mongoose_connection.getConnection().model( 'StatementWaypoint', schema, 'statementwaypoints' );