var express   = require('express');
var router    = express.Router(); 
var mongoose  = require('mongoose');
var basicAuth = require('basic-auth');
var assert    = require('assert');
var _         = require('lodash');
var util      = require('util');
var logger    = rootRequire('core/logger');

var generate  = rootRequire('commands/generate');

router.get('/wisdom', function (req, res) {
  var template = _.get(req, 'query.text');
  
  generate(template, (wisdom, template) => {
    res.send({
      "response_type": "in_channel",
      "text": wisdom,
      /*"attachments": [
          {
            "text": template
          }
      ]*/
    });
  })
})

module.exports = router;
