var moment = require("moment");
var winston = require("winston");
var config = rootRequire("core/config").get("logging");

var timeFormatFn = function() {
  'use strict';
  return moment().format(config.timeFormat);
};

var logger = new(winston.Logger)({
  exitOnError: false,
  transports: [
    new(winston.transports.DailyRotateFile)({
      filename: config.appLogName,
      dirname: __dirname + '/' + config.logsDirectory,
      datePattern: config.rollingDatePattern,
      timestamp: timeFormatFn,
      level: config.minLogLevel,
      handleExceptions: true,
    }),
    new(winston.transports.Console)({
      handleExceptions: true,
      colorize: true,
      timestamp: timeFormatFn,
      prettyPrint: true,
      level: config.minLogLevel
    })
  ]
});

module.exports = logger;