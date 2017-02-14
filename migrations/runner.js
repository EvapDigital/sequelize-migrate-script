var Promise   = require('promise');

var fs        = require('fs');
var Sequelize = require('sequelize');
var colors    = require('colors');
var path      = require('path');

var config    = process.env;
var database  = {};
var files     = [];

var sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
  dialect : 'mysql',
  pool    : {
    max: 30,
    min: 0,
    idle: 10000
  },
  host    : config.DB_ENDPOINT,
  port    : config.DB_PORT,
  logging : null
});

module.exports = function (localPath) {

  var migratesToRun = [];

  console.log('\nInitalize MIGRATIONS SCRIPT\n'.green);

  sequelize
    .authenticate()
    .then(loadMigrates)
    .then(validateDatabase)
    .then(executeMigrate)

    function loadMigrates() {
      console.log('Loading migrates files ...\n'.underline);

      return new Promise(function (success, reject) {
        fs.readdirSync(__dirname).forEach(function (file) {
          if(file.indexOf('js') != -1 && file != 'runner.js'){
            console.log('> ' + file.red);
            files.push(file);
          }
        });
        success(files);
      });
    };

    function validateDatabase() {
      console.log('\nValidate migrates files ...\n'.underline);
      return new Promise(function (success, reject) {
        var seeders = fs.readdirSync(localPath + '/seeders');
        fs.readdirSync(__dirname).forEach(function (file, i) {

          if(seeders[i] != file && file != 'runner.js'){
            console.log('> ' + file + ' VALID '.green);
            migratesToRun.push(file)
          }
        });
        success(files);
      });
    };

    function executeMigrate() {
      console.log('\nExecute migrates files ...\n'.underline);

      database.sequelize = sequelize;
      database.Sequelize = Sequelize;

      return new Promise(function (success, reject) {
        migratesToRun.forEach(function (migrate) {
          var origin  = localPath + '/migrations/' + migrate;
          var destine = localPath + '/seeders/' + migrate;
          copyFile(origin, destine, function (e) {
            if(!e) {
              var model = sequelize.import(origin);
              console.log('* '.inverse + migrate.inverse + ' DONE '.green);
            }
          });
        });
        success(migratesToRun);
        console.log('\n');
      });
    };

    function copyFile(source, target, cb) {
      var cbCalled = false;
      var rd = fs.createReadStream(source);
      rd.on("error", function(err) {
        done(err);
      });
      var wr = fs.createWriteStream(target);
      wr.on("error", function(err) {
        done(err);
      });
      wr.on("close", function(ex) {
        done();
      });
      rd.pipe(wr);

      function done(err) {
        if (!cbCalled) {
          cb(err);
          cbCalled = true;
        }
      }
    }

};
