/**
 * Created by cleitontavares on 19/11/16.
 * eVap App Migrate app
 */

var dotenv  = require('dotenv');
    dotenv.load();
var migrate = require(__dirname + '/migrations/runner')
    migrate(__dirname);
