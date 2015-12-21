#!/usr/bin/env node

global.rootRequire = function(name) {
  return require(__dirname + '/' + name);
};

var _                       = require('lodash');
var program                 = require('commander');
var request                 = require('request');
var assert                  = require('assert');
var async                   = require('async');
var Student                 = rootRequire('models/jisc/student');
var Grade                   = rootRequire('models/jisc/grade');
var StudentCourseInstance   = rootRequire('models/jisc/studentCourseInstance');
var StudentModuleInstance   = rootRequire('models/jisc/studentModuleInstance');
var Course                  = rootRequire('models/jisc/course');
var CourseInstance          = rootRequire('models/jisc/courseInstance');
var Module                  = rootRequire('models/jisc/module');
var ModuleInstance          = rootRequire('models/jisc/moduleInstance');
var Institution             = rootRequire('models/jisc/institution');

var mainApis = {
  student: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/student',
    handle: function(models, cb) {
      async.parallel(_.map(models, function(model) {
        return function(cb) {
          new Student(model).save(function(err, model){ if(err) console.log(err); cb() });
        }
      }), function(err, res){
        console.log('All students saved');
        cb();
      })
    }
  },
  course: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/course',
    handle: function(models, cb) {
      async.parallel(_.map(models, function(model) {
        return function(callback) {
          new Course(model).save(function(err, model){ if(err) console.log(err); callback() });
        }
      }), function(err, res){
        console.log('All courses saved');
        cb();
      })
    }
  },
  module: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/module',
    handle: function(models, cb) {
      async.parallel(_.map(models, function(model) {
        return function(callback) {
          new Module(model).save(function(err, model){ if(err) console.log(err); callback() });
        }
      }), function(err, res){
        console.log('All modules saved');
        cb();
      })
    }
  },
}

var childApis = {
  courseinstance: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/courseinstance',
    handle: function(models, cb) {
      async.map(models, function(model, cb){
        var courseId = model.COURSE_INSTANCE_ID.split('-')[0];
        Course.findOne({COURSE_ID: courseId}, function(err, course){
          var courseInstance = new CourseInstance(model);
          courseInstance.COURSE = course;          
          course.INSTANCES.push(courseInstance);
          async.parallel([
            function(cb){ course.save(function(err, res){ cb(err); }) },
            function(cb){ courseInstance.save(function(err, res){ cb(err); }) }
          ], function(err){ cb(err); })
        })
      }, function(err, res) {
        console.log('all course instances saved');
        cb();
      });
    }
  },
  moduleinstance: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/moduleinstance',
    handle: function(models, cb) {
      async.map(models, function(model, cb){
        var moduleId = model.MOD_INSTANCE_ID.split('-')[0];
        Module.findOne({MOD_ID: moduleId}, function(err, module){
          var moduleInstance = new ModuleInstance(model);
          moduleInstance.MODULE = module;          
          module.INSTANCES.push(moduleInstance);
          async.parallel([
            function(cb){ module.save(function(err, res){ cb(err); }) },
            function(cb){ moduleInstance.save(function(err, res){ cb(err); }) }
          ], function(err){ cb(err); })
        })
      }, function(err, res) {
        console.log('all module instances saved');
        cb();
      });
    }
  },
  grade: {
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/grade',
    handle: function(models, cb) {
      async.map(models, function(model, cb) {
        async.parallel([
          function(cb) {
            Student.findOne({STUDENT_ID: model.STUDENT_ID}, function(err, doc){ cb(err, doc); })
          },
          function(cb) {
            ModuleInstance.findOne({"MOD_INSTANCE_ID": model.MOD_INSTANCE_ID}, function(err, doc){ cb(err, doc); })
          }
        ], function(err, res) {
          assert.ifError(err);
          var student = res[0];
          var moduleInstance = res[1];
          var grade = new Grade(model);
          grade.MODULE_INSTANCE = moduleInstance;
          grade.STUDENT = student;
          student.GRADES.push(grade);
          async.parallel([
            function(cb){ student.save(function(err, res){ cb(err); }) },
            function(cb){ grade.save(function(err, res){ cb(err); }) }
          ], function(err){ cb(err); })
        })
      }, function(){
        console.log('All grades saved');
        cb();
      })
    }
  },
  studentoncourseinstance: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/studentoncourseinstance',
    handle: function(models, cb) {
      async.map(models, function(model, cb) {
        async.parallel([
          function(cb) {
            Student.findOne({STUDENT_ID: model.STUDENT_ID}, function(err, doc){ cb(err, doc); })
          },
          function(cb) {
            CourseInstance.findOne({'COURSE_INSTANCE_ID': model.COURSE_INSTANCE_ID}, function(err, doc){ cb(err, doc); })
          },
        ], function(err, res) {
          assert.ifError(err);
          var student = res[0];
          var courseInstance = res[1];
          var studentCourseInstance = new StudentCourseInstance(model);
          studentCourseInstance.COURSE_INSTANCE = courseInstance;
          studentCourseInstance.student = student;
          student.COURSE_INSTANCES.push(studentCourseInstance);
          
          async.parallel([
            function(cb){ student.save(function(err, res){ cb(err); }) },
            function(cb){ studentCourseInstance.save(function(err, res){ cb(err); }) }
          ], function(err){ cb(err); })
          
        })
      }, function(){
        console.log('All student course instances saved');
        cb();
      })
    }
  },
  studentonmoduleinstance: { 
    endpoint: 'http://uojapi.analytics.alpha.jisc.ac.uk:1339/studentonmoduleinstance',
    handle: function(models, cb) {
      async.map(models, function(model, cb) {
        var student;
        var moduleInstance;
        async.parallel([
          function(cb) {
            Student.findOne({STUDENT_ID: model.STUDENT_ID}, function(err, doc){
              assert.ifError(err);
              student = doc;
              cb();
            })
          },
          function(cb) {
            Module.findOne({'INSTANCES.COURSE_INSTANCE_ID': model.MODULE_INSTANCE_ID}, function(err, doc){
              assert.ifError(err);
              moduleInstance = doc;
              cb();
            })
          },
        ], function(err) {
          
          var studentModuleInstance = new StudentModuleInstance(model);
          studentModuleInstance.MODULE_INSTANCE = moduleInstance;
          studentModuleInstance.student = student;
          student.MODULE_INSTANCES.push(studentModuleInstance);

          async.parallel([
            function(cb){ student.save(function(err, res){ cb(err); }) },
            function(cb){ studentModuleInstance.save(function(err, res){ cb(err); }) }
          ], function(err){ cb(err); })

        })
      }, function(){
        console.log('All student module instances saved');
        cb();
      })
    }
  }
};

function handleApiResponse(api, index, cb) {
  console.log('Pulling data from ' + index);
  request(api.endpoint, function(err, res, body){
    assert.ifError(err);
    var models = JSON.parse(body);
    console.log(_.size(models) + ' '+ index +'s found');
    api.handle(models, cb);
  })
}

program.version('0.0.1');

program
  .command('jiscapi')
  .action(function () {
    
    console.log('Resetting data...');
    
    async.parallel([
      function(cb){ Student.remove({}, function(err, res){ cb(err) }) },
      function(cb){ Grade.remove({}, function(err, res){ cb(err) }) },
      function(cb){ StudentCourseInstance.remove({}, function(err, res){ cb(err) }) },
      function(cb){ StudentModuleInstance.remove({}, function(err, res){ cb(err) }) },
      function(cb){ Course.remove({}, function(err, res){ cb(err) }) },
      function(cb){ CourseInstance.remove({}, function(err, res){ cb(err) }) },
      function(cb){ Module.remove({}, function(err, res){ cb(err) }) },
      function(cb){ ModuleInstance.remove({}, function(err, res){ cb(err) }) },
      function(cb){ Institution.remove({}, function(err, res){ cb(err) }) }
    ], function(err) {
      assert.ifError(err);
      console.log('Data reset complete.');
      async.parallel(_.map(mainApis, function(api, index){
        return function(cb) {
          handleApiResponse(api, index, cb);
        }
      }),
      function(err, res){
        console.log('Saved all the main objects');
        async.series(_.map(childApis, function(api, index){
          return function(cb) {
            handleApiResponse(api, index, cb);
          }
        }),
        function(err, res){
          console.log('All models saved and related.');
          process.exit();
        });
      })
    })
  
  });
program.parse(process.argv)

