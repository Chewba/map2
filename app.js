var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var routes = require('./routes');



mongoose.connect('mongodb://qwertyuiopasdfghjkl:asdfghjkl1!@ds037737.mongolab.com:37737/econ_data', function (err, db){
 if (err) throw err;
 
 var app = express();
 app.use(express.static(path.join(__dirname, 'public')));
 routes(app);
 app.listen(3000, function (){
  console.log('listening on localhost:%s', app.port);
 });
});