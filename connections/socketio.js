var io            = require('socket.io');
var redis         = require('socket.io-redis');
var redisConfig   = rootRequire('core/config').get('redis');

var _io;

module.exports = {
  get: function() {
    return _io;
  },
  set: function(httpServer) {
    _io = io(httpServer);
    _io.adapter(redis({ host: redisConfig.host, port: redisConfig.port}));
    return _io;
  }
};