var oauth2orize       = require('oauth2orize');
var crypto            = require('crypto');
var bcrypt            = require('bcrypt');
var passport          = require('passport');

var logger            = rootRequire('core/logger');
var utils             = rootRequire('auth/utils');
var User              = rootRequire('models/user');
var AccessToken       = rootRequire('models/accessToken');
var RefreshToken      = rootRequire('models/refreshToken');



// create OAuth 2.0 server
var server = oauth2orize.createServer();

server.exchange(oauth2orize.exchange.password(function (client, username, password, scopes, cb) {
  logger.debug('Exchanging password creds for token');
  User.findOne({email: username}, function (err, user) {
    if (err) return cb(err)
    if (!user) return cb(null, false)
  
    if (password !== user.password) return cb(null, false)

    var token = utils.uid(256)
    var refreshToken = utils.uid(256)
    var tokenHash = crypto.createHash('sha1').update(token).digest('hex');
    var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex');

    var expirationDate = new Date(new Date().getTime() + (1000 * 60 * 60 * 12))

    new AccessToken({token: tokenHash, expirationDate: expirationDate, client: client._id, user: user._id, scopes: client.scopes}).save(function (err) {
      if (err) return cb(err);
      new RefreshToken({refreshToken: refreshTokenHash, client: client._id, user: user._id}).save(function (err) {
        if (err) return cb(err);
        cb(null, token, refreshToken, {expires_in: expirationDate});
      })
    })
  })
}))


server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scopes, cb) {
  var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')

  RefreshToken.findOne({refreshToken: refreshTokenHash}, function (err, token) {
    if (err) return cb(err)
      if (!token) return cb(null, false)
        if (client._id !== token.client) return cb(null, false)

        var newAccessToken = utils.uid(256)
        var accessTokenHash = crypto.createHash('sha1').update(newAccessToken).digest('hex')

        var expirationDate = new Date(new Date().getTime() + (1000 * 60 * 60 * 12))

        AccessToken.update({userId: token.userId}, {$set: {token: accessTokenHash, scopes: scopes, expirationDate: expirationDate}}, function (err) {
          if (err) return cb(err)
            cb(null, newAccessToken, refreshToken, {expires_in: expirationDate});
        })
      })
}))

// token endpoint
exports.token = [
  passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
  server.token(),
  server.errorHandler()
]