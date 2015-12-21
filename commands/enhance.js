var _                       = require('lodash');
var assert                  = require('assert');
var pos                     = require('pos');
var async                   = require('async');
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

module.exports = function () {    
  console.log(getLoadingMessage());

  data_v1.find({}, function(err, docs){  
    
    var results = _.reduce(docs, workWithComment, {});

    POS.remove({}, function(err, res){ 
      assert.ifError(err);
      async.forEachOf(results, (item, key, cb) => {        
        
        var words = _.map(item, item => ({
          word: item.word,
          count: item.count,
          length: item.word.length
        }));

        // save the POS collection
        var newPos = new POS({
          tag: key, 
          averageCount: _.sum(words, 'count') / words.length,
          words: words
        })
        
        newPos.save(function(err) {
          assert.ifError(err);
          cb();
        });

      }, err => {
        // all new POS saved
        assert.ifError(err);
        console.log('All done, thanks for your patience');
        process.exit();
      })
    })

  })

}