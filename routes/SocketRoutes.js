var _       = require('lodash');
var logger  = rootRequire('core/logger');
var io      = rootRequire('connections/socketio');

var _io;

module.exports =  {
  
  register: function() {
    _io = io.get();

    _io.use(this.authorization);
    _io.on('connection', this.connection);
  },

  /**
   * Checks that the user is valid before allowing a connection
   */
  authorization: function(socket, next) {
    var handshakeData = socket.request;
    next();
    //socket.join(orgId);
    // TODO authorise via basic auth or oauth
    // TODO put the user into the correct room for their LRS
  },

  connection: function( socket, next ){
    /* STANDARD */
    socket.on( 'disconnect',     disconnect );
    socket.on( 'join',           join );
    socket.on( 'leave',          leave );

    var auth_user = socket.request.auth_user;
    socket.emit('user:auth_success', auth_user);
    
    function disconnect() {}

    /**
     * connects the socket to a model's room
     * @param  {String} type    type of model to follow ('journey', 'stream')
     * @param  {Object} filter  query object to filter which models are emitted 
     */
    function join(type, filter) {
      socket.join(type);
    }

    function leave() {
      
    }

  }

};

