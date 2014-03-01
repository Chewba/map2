var mongoose = require('mongoose');

var schema = new mongoose.Schema({
 city: {type: String}
 , state: {type: String}
 , zip : {type: String, index: true}
 , lat: {type: Number}
 , lng: {type: Number}
 , loc: [Number]
 , taxReturns: {type: Number}
 , totalWages: {type: Number}
 , avg_wages: {type: Number}
 , pop : Number
 , extPop: Number
 , geometry: [Number]
});

schema.index({ loc: '2d'});

schema.statics.findNear = function (lat, lng, dist, callback) {
 var agg = [];
 var near = [lat, lng];
 agg.push({
  $geoNear:
  {near:near
   ,distanceField:"dist"
   , maxDistance:dist
  }
 });
 agg.push({$sort:{avg_wages:-1}});
 //agg.push({$limit: 2});
 //console.log(agg);
 this.aggregate(agg, function (err, data) {
  if(err) return callback(err);
  callback(err, data);
 });
};

module.exports = mongoose.model('Zip', schema);