'use strict';

var mongoose        = require('mongoose');
var mongodbConfig   = rootRequire('core/config').get('mongodb');

var dbConnection = mongoose.createConnection(mongodbConfig.uri, mongodbConfig.opts);
    dbConnection.on('error', function( err ){
      console.log("MONGOOSE connection error:", err);
      console.log("MONGOOSE using config:", mongodbConfig);
    });

var dbSchemas = dbConnection.models;

module.exports = {
  modelContainer: function getModel(model){ // the name of the model
    return dbConnection.model(model);
  },
  getDbSchemas: function() {
    return dbSchemas;
  },
  getConnection: function() {
    return dbConnection;
  }
};