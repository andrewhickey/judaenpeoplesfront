#!/usr/bin/env node

global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
};

var _                       = require('lodash');
var program                 = require('commander');
var request                 = require('request');
var assert                  = require('assert');
var Comments                = rootRequire('models/comments');
var getLoadingMessage       = rootRequire('helpers/getLoadingMessage');
var WordPOS                 = require('wordpos');

program.version('0.0.1');

program
  .command('enhance')
  .action(function () {    
    console.log(getLoadingMessage());
    wordpos = new WordPOS();
    var comment = Comments[Math.floor(Math.random() * Comments.length)];
    console.log('Input: ' + comment);
    wordpos.getPOS(comment, function(res){
      console.log(res);
    })
  });
program.parse(process.argv)

