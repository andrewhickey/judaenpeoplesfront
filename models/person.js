'use strict';
var assert              = require('assert');
var mongoose            = require('mongoose');
var _                   = require('lodash');
var string_score        = require('string_score');
var SaveClientId        = rootRequire('models/plugins/SaveClientId');
var mongoose_connection = rootRequire('connections/mongoose');
var ScoringScheme       = rootRequire('models/scoringscheme');
var Organisation        = rootRequire('models/organisation');
var LRS                 = rootRequire('models/lrs');

var identifierSchema = new mongoose.Schema({
    key           : { type: String }
  , values        : { type: [String] }
});

var PersonSchema = new mongoose.Schema({
    organisation      : { type: mongoose.Schema.ObjectId, ref : 'Organisation', index: true }
  , identifiers       : { type: [ identifierSchema ], default: [] }
  , personStatements  : [{ type : mongoose.Schema.ObjectId, ref : 'PersonStatement' }]
  , personStudents    : [{ type : mongoose.Schema.ObjectId, ref : 'PersonStudent' }]
});

PersonSchema.methods.addIdentifier = function(key, value) {
  var identifier = _.find(this.identifiers, {key: key});
  
  // add the given value to an identifier with the given key
  if (identifier) identifier.values = _.union(identifier.values, [value]);
  
  // create a new identifier if there isn't one with the key already
  else this.identifiers.push({key: key, values: [value]});
}

PersonSchema.methods.getIdentifierKeys = function() {
  const keys = _.pluck(this.identifiers, 'keys');
  return keys;
}

PersonSchema.methods.getIdentifierValues = function() {
  const values = _.pluck(this.identifiers, 'values');
  return _.flatten(values);
}

PersonSchema.methods.scoreAgainstData = function(keyValues, scoringScheme) {
  // matches the person against the given data and returns a score
  return _.reduce(keyValues, function(result, value, key){    
    let score = 0;
    
    if(value) {

      // match the value against every saved value we have for this person
      const identifier = _.find(this.identifiers, {key: key})

      if(identifier) {
        const weight = _.get(scoringScheme, ['keys', key], 0);
        
        // return only the top scoring value for this key
        const maxScore = _.max(_.map(identifier.values, function(identValue){
          return identValue.score(value);
        }));

        score = maxScore * weight;
      }
    }
    
    return result + score;

  }, 0, this);
}

PersonSchema.statics.findTopScoring = function(lrs_id, keyValues, cb) {
  const self = this;

  // finds the top scoring person for the given lrs and keyValues
  ScoringScheme.findOrCreate({lrs_id: lrs_id}, function(err, scoringScheme){

    assert.ifError(err);

    self.find({lrs_id: lrs_id}, function (err, persons) {
      assert.ifError(err);
      
      const topScorer = _.max(persons, function (person) {
        person.score = person.scoreAgainstData(keyValues, scoringScheme);
        return person.score;
      });
      
      cb( topScorer.score >= scoringScheme.targetScore ? topScorer : null );

    });
  });
}

PersonSchema.statics.filterByClient = function(client, cb) {
  var self = this;
  LRS.filterByClient(client, function(query) {
    query.exec(function(err, lrsList) {
      var lrsIds = _.pluck(lrsList, '_id');
      cb( self.find({ lrs_id: { $in: lrsIds} }) );
    })
  })
}

PersonSchema.plugin(SaveClientId);

module.exports = mongoose_connection.getConnection().model( 'Person', PersonSchema, 'people');