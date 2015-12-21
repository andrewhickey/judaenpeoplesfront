#!/usr/bin/env node

global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
};

var _                       = require('lodash');
var program                 = require('commander');
var request                 = require('request');
var assert                  = require('assert');
var pos                     = require('pos');
var async                   = require('async');
var mongoose_connection     = rootRequire('connections/mongoose');
var data_v1                 = rootRequire('models/data_v1');
var POS                     = rootRequire('models/pos');
var getLoadingMessage       = rootRequire('helpers/getLoadingMessage');


var lexer = new pos.Lexer()
var tagger = new pos.Tagger()

function workWithComment(results, item) {
  var words = lexer.lex(item.text);
  var taggedWords = tagger.tag(words);
  _.each(taggedWords, addTagToResults.bind(null, results))
  return results;
}

function addTagToResults(results, taggedWord) {
  var word = taggedWord[0].toLowerCase();
  var pos = taggedWord[1];

  if(!_.isObject(results[pos])) results[pos] = {};
  var bucket = results[pos];

  if(!_.isObject(bucket[word])) bucket[word] = {word: word, count: 0}

  bucket[word].count += 1;
}

program.version('0.0.1');

program
  .command('enhance')
  .action(function () {    
    console.log(getLoadingMessage());

    data_v1.find({}, function(err, docs){  
      
      var results = _.reduce(docs, workWithComment, {});

      async.forEachOf(results, (item, key, cb) => {        
        
        // save the POS collection
        var newPos = new POS({
          tag: key, 
          words: _.values(item)
        })
        
        newPos.save(function(err) {
          assert.ifError(err);
          cb();
        });

      }, err => {
        // all new POS saved
        assert.ifError(err);
        process.exit();
      })

    })

  });

program.parse(process.argv)

