var express   = require('express');
var router    = express.Router(); 
var restify   = require('express-restify-mongoose');
var mongoose  = require('mongoose');
var basicAuth = require('basic-auth');
var assert    = require('assert');
var _         = require('lodash');
var util      = require('util');

var oauth2        = rootRequire('auth/oauth2');
var passport      = rootRequire('core/passport');
var logger        = rootRequire('core/logger');

// JISC
var Student                 = rootRequire('models/jisc/student');
var Grade                   = rootRequire('models/jisc/grade');
var StudentCourseInstance   = rootRequire('models/jisc/studentCourseInstance');
var StudentModuleInstance   = rootRequire('models/jisc/studentModuleInstance');
var Course                  = rootRequire('models/jisc/course');
var CourseInstance          = rootRequire('models/jisc/courseInstance');
var Module                  = rootRequire('models/jisc/module');
var ModuleInstance          = rootRequire('models/jisc/moduleInstance');
var Institution             = rootRequire('models/jisc/institution');

// CORE
var Statement     = rootRequire('models/statement');
var LRS           = rootRequire('models/lrs');
var Client        = rootRequire('models/client');
var Organisation  = rootRequire('models/organisation');
var Journey       = rootRequire('models/journey');
var Stream        = rootRequire('models/stream');
var Person        = rootRequire('models/person');
var Visualisation = rootRequire('models/visualisation');

// authorization
router.post('/oauth2/token', oauth2.token)
router.get('/restricted', passport.authenticate('accessToken', { session: false }), function (req, res) {
  res.send("You successfully accessed the restricted resource!")
})
router.get('/test', function (req, res) {
  
  Visualisation.findOne({})
    .exec(function(err,doc){

      const newMatch = req.body.match;
      console.log(req.body);
      doc.match = newMatch;
      doc.save((err,doc) => {
        res.send(doc)
      })

    })
})

/**
 * REST APIS
 */
restify.defaults({
  lowercase: true,
  lean: false,
  findOneAndUpdate: false,
  preMiddleware: function (req, res, next) {
    passport.authenticate('accessToken', { session: false })(req, res, function(err) {
      console.log('BODY', req.body);
      next();
    });    
  },
  contextFilter: function(model, req, cb) {
    var client = req.authInfo.client || {};
    model.filterByClient( client, query => cb(query) );
  },
  access: function(req) {
    return 'private';
  },
  onError: function(err, req, res, next){
    res.send(err.message);
    next();
  }
})

// core
restify.serve(router, Organisation);
restify.serve(router, Journey);
restify.serve(router, Stream);
restify.serve(router, Person);
restify.serve(router, User);
restify.serve(router, Client);
restify.serve(router, Visualisation);
restify.serve(router, LRS, {
  outputFn: function(req, res) {
    // add statement counts to each lrs
    LRS.appendStatementCount(req.erm.result, function(results){      
      res.status(req.erm.statusCode || 200);
      res.send(results)
    })
  }
});

router.get('/api/v1/statements/aggregate', passport.authenticate('accessToken', { session: false }), function (req, res) {
  var firstItem=true;
  res.set('Content-Type', 'application/json');
  var client = req.authInfo.client || {};
  LRS.aggregateStatementsByClient(client, req.query.pipeline, function(stream) {
    res.write('[');
    stream.on('data', function (doc) {
        // Start the JSON array or separate the next element.
        res.write(firstItem ? (firstItem=false,'') : ',');
        res.write(JSON.stringify(doc));
    });
    stream.on('end', function() {
        res.end(']');
    });
  });
});

var jiscSettings = {
  middleware: [],
  contextFilter: null,
  access: null
}

// jisc
restify.serve(router, Student, jiscSettings);
restify.serve(router, Grade, jiscSettings);
restify.serve(router, StudentCourseInstance, jiscSettings);
restify.serve(router, StudentModuleInstance, jiscSettings);
restify.serve(router, Course, jiscSettings);
restify.serve(router, CourseInstance, jiscSettings);
restify.serve(router, Module, jiscSettings);
restify.serve(router, ModuleInstance, jiscSettings);
restify.serve(router, Institution, jiscSettings);

module.exports = router;