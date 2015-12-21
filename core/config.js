var nconf = require('nconf');
var path = require('path');

// set configuration sources in order of priority
// values set first will overwrite values from later sources

// 1.
// overrides take top priority
//
nconf.overrides({
});

// 2.
// anything passed as an argument on startup or as an environment variable
//
nconf.env().argv();

//
// 3.
// if a specific environment has been given then load that environment's config
//
var node_env = nconf.get('NODE_ENV');

if( node_env ) {
  console.log( 'Looking for config file: ' + path.join(__dirname, '..', 'config', node_env + '.json') );

  nconf.file( node_env, path.join(__dirname, '..', 'config', node_env + '.json') );
} else {
  console.log('NODE_ENV not specified, using default config.');
  console.log('Try setting NODE_ENV e.g. NODE_ENV=production node server.js');
}

//
// 4.
// always load the default config
//
console.log( 'Looking for config file: ' + path.join(__dirname, '..', 'config', 'default.json') );
nconf.file('default', path.join(__dirname, '..', 'config', 'default.json') );


module.exports = nconf;