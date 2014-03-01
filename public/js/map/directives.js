
var mapAppDirectives = angular.module('mapAppDirectives', []);

mapAppDirectives.directive('map', function() {
 var map;
 var id;
 var infoWindow = new google.maps.InfoWindow({ content:'<div id="infoWindow"></div>' });
 var mapDone = false;
 var gotMarkers = false;
 var init = function (){
  var lat = 33.68592904428319;
  var lng = -117.84477688153993;
  center = new google.maps.LatLng(lat, lng);
  var map_options = {
   zoom: 10,
   center: center,
   mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  
  map = new google.maps.Map(document.getElementById(id), map_options);
  mapDone = true;
 };

 var placeMarkers = function (zipsData) {
  if(gotMarkers && mapDone){
   // create marker
   var colorRed = 255;
   var colorGreen = 200;
   var colorBlue = 50;
   zipsData.forEach(function (ele, idx, blah) {
    if(ele.geometry[0].length) {
     var path = []
     ele.geometry.forEach(function(e, i, a){
      path.push(new google.maps.LatLng(e[0],e[1]));
     })
     path.push(new google.maps.LatLng(ele.geometry[0][0],ele.geometry[0][1]));
     cRed = 16 + Math.floor(255 - colorRed * ele.pct);
     cGreen = 16 + Math.floor(colorGreen * ele.pct);
     cBlue =  16 + Math.floor(colorBlue * ele.pct);
     color = '#' + cRed.toString(16)+ cGreen.toString(16)+ cBlue.toString(16);
     var zipBound = new google.maps.Polygon({
      paths: path,
      strokeColor: color,
      strokeWeight:2,
      fillColor: color,
      fillOpacity:0.40
     });
     zipBound.setMap(map);
     // Add a listener for the click event.
     google.maps.event.addListener(zipBound, 'click', function(event){ dataWindow(event, ele)});
    }
   });
  };
 };
 
 var dataWindow = function (event, ele) {
  var contentString = '<div id="infoWindow"><b>City:</b>'+ele.city+'<br>';
  contentString += '<b>State:</b>'+ele.state+'<br>';
  contentString += '<b>Zip:</b>'+ele._id+'<br>';
  contentString += '<b>pct of high:</b>'+(ele.pct * 100).toPrecision(4)+'%<br></div>';
  // Replace the info window's content and position.
  infoWindow.setContent(contentString);
  infoWindow.setPosition(event.latLng);

  infoWindow.open(map);
 };
 
 var mapRefresh = function ($scope) {
  // create map
  $scope.mapRefresh = false;
  var lat = $scope.location.lat;
  var lng = $scope.location.lng;
  center = new google.maps.LatLng(lat, lng);
  
  var map_options = {
   zoom: $scope.getZoom(),
   center: center,
   mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById(id), map_options);
  
  
  google.maps.event.addListener(map, 'mouseup', function() {
   var center = map.getCenter();
   var addr = {
    lat: center.d,
    lng: center.e,
    address: 'lat: '+ center.d + ', long: ' + center.e,
    location:{lat:center.d, lng:center.e}
   };

   $scope.setAddress(addr);
   $scope.mapRefresh = true;
  });
  google.maps.event.addListener(map, 'zoom_changed', function() {
   var zoomLevel = map.getZoom();
   $scope.setZoom(zoomLevel);
   $scope.setAddress($scope.thisAddr);
   $scope.mapRefresh = true;
  });
  // create marker
 }
 
 return {
  restrict: 'E',
  replace: true,
  template: '<div></div>',
  link: function($scope, element, attrs) {
   id = attrs.id;
   init();
   $scope.$watch('mapRefresh',function(trigger){
    if(trigger){
     mapRefresh($scope);
     placeMarkers($scope.zipsData);
    };
   });
   $scope.$watch('mapVisible',function(trigger){
    if(trigger){
     mapRefresh($scope);
     placeMarkers($scope.zipsData);
    };
   });
   $scope.$watch('selected', function () {
    $scope.mapVisible=($scope.selected == 'map');
   });
   $scope.$watch('gotMarkers',function(trigger){
    gotMarkers = trigger;
    placeMarkers($scope.zipsData);
   });
  }
 }
});
