var session       = require('express-session');
var sessionConfig = rootRequire('core/config').get('session');
var MongoDBStore  = require('connect-mongodb-session')(session);
var mongoConfig   = rootRequire('core/config').get('mongodb');


var store;

if(sessionConfig.store === "mongodb") {
  store = new MongoDBStore({ 
    uri: mongoConfig.uri,
    opts: mongoConfig.opts,
    collection: 'sessions'
  });
}

var sessionOpts = {
  secret: sessionConfig.secret,
  cookie: sessionConfig.cookie,
  resave: sessionConfig.resave,
  saveUninitialized: sessionConfig.saveUninitialized,
  store: store
}

module.exports = session(sessionOpts);