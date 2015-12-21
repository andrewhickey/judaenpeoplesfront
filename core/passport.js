var passport                = require('passport');
var ClientPasswordStrategy  = require('passport-oauth2-client-password');
var BasicStrategy           = require('passport-http').BasicStrategy;
var BearerStrategy          = require('passport-http-bearer').Strategy;
var crypto                  = require('crypto');

var logger                  = rootRequire('core/logger');
var User                    = rootRequire('models/user');
var Client                  = rootRequire('models/client');
var AccessToken             = rootRequire('models/accessToken');

//passport.authenticate('basic', { session: false })
passport.use("clientBasic", new BasicStrategy(
  function(clientId, clientSecret, done) {
    Client.findOne({ "api.basic_key":  clientId}, function (err, client) {
      if (err) return done(err);
      if (!client) return done(null, false);
      if (!client.isTrusted) return done(null, false);
      
      if (client.api.basic_secret == clientSecret) return done(null, client)
      else return done(null, false)
    });
  }
));

//passport.authenticate(['basic', 'oauth2-client-password'], { session: false })
passport.use("clientPassword", new ClientPasswordStrategy(  
  function(clientId, clientSecret, done) {    
    Client.findOne({ "api.basic_key":  clientId}, function (err, client) {
      if (err) return done(err);
      if (!client) return done(null, false);
      if (!client.isTrusted) return done(null, false);
      if (client.api.basic_secret == clientSecret) return done(null, client)
      else return done(null, false)
    });
  }
));

passport.use("accessToken", new BearerStrategy(
  function (accessToken, done) {
    var accessTokenHash = crypto.createHash('sha1').update(accessToken).digest('hex');
    
    AccessToken.findOne({token: accessTokenHash}).populate('user').exec(function (err, token) {
      if (err) return done(err);
      if (!token) return done(null, false);

      Client.findById(token.client, function(err, client){
        if (err) return done(err);
        if (!client) return done(null, false);
        if (new Date() > token.expirationDate) {
          AccessToken.remove({token: accessTokenHash}, function (err) { done(err) })
        } 
        else {
          logger.debug('Access token authentication successful');
          // if the token is registered to a user return that user
          if (!token.user) return done(null, false)
          // no use of scopes for now
          var info = { client: client }
          logger.debug('Access token has user');
          done(null, token.user, info);
        }
      })
    })
  }
));


module.exports = passport;