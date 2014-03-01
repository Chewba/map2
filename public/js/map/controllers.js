/*jslint indent:1 */
var mapAppControllers = angular.module('mapAppControllers', []);
mapAppControllers.controller('mapCtrl', function ($scope, $http, MapService) {
 'use strict';
 var hasAddr = false,
  zoom = 10;

 $scope.setZoom = function (z) {
  zoom = z;
 };
 $scope.getZoom = function () {
  return zoom;
 };
 $scope.gotAddress = function () {
  return hasAddr;
 };
 $scope.openDropdown = function () {
  return hasAddr && $scope.lat === undefined;
 };
 $scope.isActiveAddress = function (address) {
  return $scope.address === address;
 };
 
 $scope.setAddress = function (address) {
  var highest = 1;
  $scope.lat = address.lat;
  $scope.lng = address.lng;
  $scope.address = address.address;
  $scope.location = address.location;
  $scope.thisAddr = address;
  $scope.zipsData = [];
  $scope.gotMarkers = false;
  MapService.findInRadius(address.lat, address.lng, zoom)
   .success(function (data) {
    data.forEach(function (ele, index, data) {
     $scope.zipsData.push({
      '_id' : ele.zip,
      city : ele.city,
      state : ele.state,
      loc : ele.loc,
      pct : ele.wage_ratio,
      geometry: ele.geometry,
      avg_wages : (Math.round(ele.avg_wages * 100, 2) / 100).toLocaleString("en-EN", {style : "currency", currency : "USD"})
     });
    });
    console.log('setting got markers');
    $scope.gotMarkers = true;
   }).error(function (err) {
    if (err) {
     throw err;
    }
   });
  $scope.map = {
   center: {
    latitude: address.lat,
    longitude: address.lng
   },
   zoom: 8
  };
  $scope.$watch('active', function () {
   window.setTimeout(function () {
    google.maps.event.trigger(map, 'resize');
   }, 100);
  });
 };
 $scope.getAddr = function (addr) {
  $scope.selected = 'grid';
  $scope.addresses = [];
  hasAddr = false;
  $scope.lat = undefined;
  MapService.geocode(encodeURIComponent(addr))
   .success(function (data) {
    hasAddr = true;
    data.forEach(function (ele, index, data) {
     $scope.addresses.push({
      'address' : ele.formatted_address,
      'location' : ele.geometry.location,
      'lat' : ele.geometry.location.lat,
      'lng' : ele.geometry.location.lng
     });
    });
    if (data.length === 1) {
     $scope.setAddress($scope.addresses[0]);
    }
   }).error(function (err) {
    $scope.googleDataLoaded = false;
    $scope.addresses = [];
    $scope.address = undefined;
    $scope.location = undefined;
    $scope.lat = undefined;
    $scope.lng = undefined;
    $scope.zipsData = [];
    $scope.selected = 'grid';
    $scope.map = {
     center: {
      latitude: 0,
      longitude: 0
     },
     zoom: 8
    };
   });
 };
 $scope.googleDataLoaded = false;
 $scope.addresses = [];
 $scope.address = undefined;
 $scope.location = undefined;
 $scope.lat = undefined;
 $scope.lng = undefined;
 $scope.zipsData = [];
 $scope.selected = 'grid';
 $scope.gotMarkers = false;
 $scope.map = {
  center: {
   latitude: 0,
   longitude: 0
  },
  zoom: 8
 };
});
