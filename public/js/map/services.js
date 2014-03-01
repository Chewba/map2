var mapAppServices = angular.module('mapAppServices',['ngResource']);

mapAppServices.factory('MapService',['$resource','$http', function ($resource, $http){
 var factory = {};

 zoomToRadius = function(zoom){
  var radii = [24901,12450.5,6225.25,3112.625,1556.3125,778.15625,389.078125,194.5390625,97.26953125,48.634765625,24.3173828125,12.15869140625,6.079345703125,3.0396728515625,1.51983642578125,0.759918212890625,0.379959106445312,0.189979553222656,0.094989776611328,0.047494888305664,0.023747444152832,0.011873722076416];
  return radii[zoom];
 };

 factory.geocode = function (address){
  return $http.get('/api/geocode/'+address);
 };
 
 factory.findInRadius = function(lat, lng, zoom){
  uri = '/api/findInRadius/lat/'+lat+'/lng/'+lng+'/dist/'+zoomToRadius(zoom);
  return $http.get(uri);
 };
 
 return factory;
}]);

