var http = require('http');
var Zip = require('../models/zip');

module.exports = function (app){

 // geocode an address:
 app.get('/api/geocode/:address', function (req, res, next){
  http.get('http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address='+ req.params.address, function (resp){
   var responseParts=[];
   resp.setEncoding('utf8');
   resp.on('data', function (d){
    responseParts.push(d);
   });
   resp.on('end', function(){
    var d = JSON.parse(responseParts.join(''));
    res.send(d.results);
   })
  }).on('error', function (err){
   next(err);
  })
 });
 
 //get zips in radius
 app.get('/api/findInRadius/lat/:lat/lng/:lng/dist/:dist', function(req, res, next){
  //if (!(req.params.lat && req.params.long)) next(new Error('Invalid Data'));
  var lat = parseFloat(req.params.lat);
  var lng = parseFloat(req.params.lng);
  var dist = req.params.dist !== 'undefined' ? parseFloat(req.params.dist) : 10;
  dist = dist/69;
  Zip.findNear(lat, lng, dist, function (err, data){
   if (err) next(err);
   if (data.length == 0) {
    next(new Error('No records found'));
   } else {
    var maxWage = data[0].avg_wages;
    data.forEach(function(ele, idx, arr){
     data[idx].wage_ratio = ele.avg_wages / maxWage;
    })
    res.send(data);
   }
  });
  
 });
};