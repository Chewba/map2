var error = require('./error');
var api = require('./api');

module.exports = function (app){
 app.get('/', function (req, res){
  res.render('home.jade');
 });
 // load api routes
 api(app);
 
 //deal with errors
 error(app);
};