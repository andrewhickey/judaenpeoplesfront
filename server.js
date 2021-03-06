/*
| -------------------------------------------------------------------
| Learning Locker - Node server
| -------------------------------------------------------------------
*/

'use strict';

global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
};

var app             = require('express')();
var cors            = require('cors');
var path            = require("path");
var cowsay          = require('cowsay');
var http            = require('http');  
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var methodOverride  = require('method-override');
var blocked         = require('blocked');

var logger          = rootRequire('core/logger');
var appConfig       = rootRequire('core/config').get('app');
var io              = rootRequire('connections/socketio');
var SocketRoutes    = rootRequire('routes/SocketRoutes');
var HttpRoutes      = rootRequire('routes/HttpRoutes');

/*
|----------------------------------------------------------------------
| HTTP handlers
|----------------------------------------------------------------------
*/
app.use(cors({origin: true, credentials: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

app.use(HttpRoutes);

var server = http.createServer(app);
server.listen(appConfig.port, '0.0.0.0');

const message = "Judean People's Front - listening on port: " + appConfig.port + '...';
console.log(message);

// required to catch unhandled promise errors
process.on('unhandledRejection', function (err, p) {
  console.error(err.stack)
});