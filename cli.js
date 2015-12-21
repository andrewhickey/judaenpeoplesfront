#!/usr/bin/env node

global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
};

var _                       = require('lodash');
var program                 = require('commander');
var request                 = require('request');
var enhance                 = rootRequire('commands/enhance');
var generate                = rootRequire('commands/generate');

program.version('0.0.1');

program.command('enhance')
       .action(enhance);

program.command('generate')
       .option('-t, --template', 'Template string')
       .action(generate);

program.parse(process.argv)

