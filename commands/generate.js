var _                       = require('lodash');
var assert                  = require('assert');
var async                   = require('async');
var POS                     = rootRequire('models/pos');
var getLoadingMessage       = rootRequire('helpers/getLoadingMessage');

var defaultTemplates = [
  "JJ NNS VBP JJ NN",
  "JJ NNP VBZ JJ NN",
  "Jasper VBZ the sausage"
];


var punctuationRegex = "[.,\\\?!:;<>\\\[\\\]{}\"'\\\\\\/£\\\$%\\\^\\\&\\\*\\\(\\\)@#=\\\+\\\-\\\_`]";

var customTokens = {
  'XMAS' : [
    'ham','bacon','pastrami','spare ribs','hot dogs',
    'frankfurters','rohwurst','sausages','kochwurst',
    'pancetta','spam','chorizo','salami','eggnog',
    'elves','reindeer','gingerbread houses','plum puddings',
    'frankincense','mistletoe','yule log','stuffing','turkeys'
  ]
}

var posTokens = {
  'CC':{},'CD':{},'DT':{},'EX':{},
  'FW':{},'IN':{},'JJ':{},'JJR':{},
  'JJS':{},'LS':{},'MD':{},'NN':{},
  'NNP':{},'NNPS':{},'NNS':{},'POS':{},
  'PDT':{},'PP$':{},'PRP':{},'RB':{},
  'RBR':{},'RBS':{},'RP':{},'SYM':{},
  'TO':{},'UH':{},'VB':{},'VBD':{},
  'VBG':{
    minLength: 4
  },'VBN':{
    minLength: 4
  },'VBP':{
    minLength: 4
  },'VBZ':{
    minLength: 4
  },
  'WDT':{},'WP':{},'WP$':{},'WRB':{},
  ':{},':{},'.':{},':':{},'$':{},
  '#':{},'"':{},'(':{},')':{}
}

const punctuation = ['.,?!:;<>[]{}"\'\\/£$%^&\*\(\)']




function parseToken (token, cb) {
  if(_.contains(_.keys(customTokens), token)) {
    cb(null, customTokens[token][Math.floor(Math.random() * customTokens[token].length)]); 
  } else if (_.contains(_.keys(posTokens), token)) {
    POS.findOne({
      'tag': token
    }, {
      tag: 1,
      averageCount: 1
    }, (err, res) => {
      
      var defaults = {
        minLength: 1,
        minCount: _.get(res, 'averageCount', 1)
      };

      opts = _.defaults( posTokens[token], defaults);
      console.log('OPTS FOR', token, opts);

      POS.random({
        'tag': token,
        'words.length': {$gte: opts.minLength},
        'words.count': {$gte: opts.minCount},
      }, function(err, res) {
        assert.ifError(err);
        cb(null, _.get(res, 'word', 'WORDMISSING'))
      })

    })
  } else {
    cb(null, token);
  }
}

module.exports = function ( template, cb ) {
  if( !_.isString(template) || template === "" )
    template = defaultTemplates[Math.floor(Math.random() * defaultTemplates.length)]

  template = template.replace( new RegExp(punctuationRegex, 'g'), ' $&' );

  var tokens = template.split(' ');


  async.map(tokens, parseToken, 
    (err, res) => {      
      res[0] = res[0].charAt(0).toUpperCase() + res[0].slice(1);
      var sentence = _.reduce(res, (sentence, word) => sentence + word + " ", "");
      sentence = sentence.trim();

      sentence = sentence.replace( new RegExp("(\\\s)("+punctuationRegex+")", 'g'), '$2' );


      console.log(sentence);
      if(_.isFunction(cb)) cb(sentence, template)
      else process.exit();
  })

  
}