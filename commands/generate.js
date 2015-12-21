var _                       = require('lodash');
var assert                  = require('assert');
var async                   = require('async');
var POS                     = rootRequire('models/pos');
var getLoadingMessage       = rootRequire('helpers/getLoadingMessage');

var defaultTemplates = [
  "JJ NNS VBP JJ NN",
  "JJ NNP VBZ JJ NN",
  "DOG VBZ the sausage",
  "DOG is coming for the XMAS",
  "JJ NN, JJ NN!",
  "DOG VBZ the XMAS",
  "HT2 says 'VBP JJR XMAS'"
];


var punctuationRegex = "[.,\\\?!:;<>\\\[\\\]{}\"'\\\\\\/£\\\$%\\\^\\\&\\\*\\\(\\\)@#=\\\+\\\-\\\_`]";

var customTokens = {
  'XMAS' : [
    'ham','bacon','pastrami','spare ribs','hot dogs',
    'frankfurters','rohwurst','sausages','kochwurst',
    'pancetta','spam','chorizo','salami','eggnog',
    'elves','reindeer','gingerbread houses','plum puddings',
    'frankincense','mistletoe','yule log','stuffing','turkeys'
  ],
  'DOG' : [
    'Manny', 'Jasper', 'Daisy', 'Lulu'
  ],
  'HT2': [ 
    'James', 'Andrew', 'Janet', 'Alan', 'Pete', 'Ryan', 'Steven', 'Ben', 'Andie', 'Katharina', 'Craig', 'Dave'
  ]
}

var posTokens = {
  'CC':{},'CD':{},'DT':{},'EX':{},
  'FW':{},'IN':{},'JJ':{},'JJR':{},
  'JJS':{},'LS':{},'MD':{},
  'NN':{
    minLength: 4,
    minCount: 5
  },
  'NNP':{
    minLength: 4,
    minCount: 5
  },
  'NNPS':{
    minLength: 4,
    minCount: 5
  },
  'NNS':{
    minLength: 4,
    minCount: 5
  },
  'POS':{},
  'PDT':{},'PP$':{},'PRP':{},'RB':{},
  'RBR':{},'RBS':{},'RP':{},'SYM':{},
  'TO':{},'UH':{},
  'VB':{
    minLength: 4,
    minCount: 5
  },
  'VBD':{
    minLength: 4,
    minCount: 5
  },
  'VBG':{
    minLength: 4,
    minCount: 5
  },'VBN':{
    minLength: 4,
    minCount: 5
  },'VBP':{
    minLength: 4,
    minCount: 5
  },'VBZ':{
    minLength: 4,
    minCount: 5
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

  template = template.replace( new RegExp(punctuationRegex, 'g'), ' $& ' );

  var tokens = template.split(' ');


  async.map(tokens, parseToken, 
    (err, res) => {      
      res[0] = res[0].charAt(0).toUpperCase() + res[0].slice(1);
      var sentence = _.reduce(res, (sentence, word) => sentence + word + " ", "");

      sentence = sentence.replace( new RegExp("(\\\s)("+punctuationRegex+")(\\\s)", 'g'), '$2' );
      sentence = sentence.trim();


      console.log(sentence);
      if(_.isFunction(cb)) cb(sentence, template)
      else process.exit();
  })

  
}