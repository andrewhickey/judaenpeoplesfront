'use strict';

var TinCan          = require('tincan');
var tincanjsConfig  = rootRequire('core/config').get('tincan');

var tincan = new TinCan (tincanjsConfig);

module.exports = tincan;
