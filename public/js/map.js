var mapApp = angular.module('mapApp',['directives']);

/*
mapApp.controller('mapCtrl', function ($scope, $http){
 $scope.ohMy = 'Oh My Goodness';
}) 
*/

mapApp.controller('mapCtrl', function ($scope, $http){
 var hasAddr = false;
 var zoom = 10;
 var radii = [24901,12450.5,6225.25,3112.625,1556.3125,778.15625,389.078125,194.5390625,97.26953125,48.634765625,24.3173828125,12.15869140625,6.079345703125,3.0396728515625,1.51983642578125,0.759918212890625,0.379959106445312,0.189979553222656,0.094989776611328,0.047494888305664,0.023747444152832,0.011873722076416];
 radiusToZoom = function(radius){
  return Math.round(14-Math.log(radius)/Math.LN2);
 }
 zoomToRadius = function(zoom){
  return radii[zoom];
 }
 $scope.getGoogleData = function (){
  var zipsArr = [];
  $scope.googleDataLoaded=false;
  $scope.zipsData.forEach(function(ele, idx, arr){
   zipsArr.push("'" + ele._id+"'");
  })
 };
 $scope.setZoom = function (z){
  zoom = z;
 }
 $scope.getZoom = function (){
  return zoom;
 }
 $scope.gotAddress = function (){
  return hasAddr;
 };
 $scope.openDropdown = function (){
  return hasAddr && $scope.lat === undefined;
 };
 $scope.isActiveAddress = function (address){
  return $scope.address === address;
 }
 $scope.setAddress = function (address){
  var highest = 1;
  $scope.lat = address.lat;
  $scope.lng = address.lng;
  $scope.address = address.address;
  $scope.location = address.location;
  $scope.zipsData = [];
  $http.get('/api/findInRadius/lat/' + address.lat + '/lng/'+ address.lng + '/dist/'+ zoomToRadius(zoom))
   .success(function (data){
    data.forEach(function (ele, index, data){
     $scope.zipsData.push({
      _id : ele.zip,
      city : ele.city,
      state : ele.state,
      loc : ele.loc,
      pct : ele.wage_ratio,
      geometry: ele.geometry,
      avg_wages : (Math.round(ele.avg_wages*100,2)/100).toLocaleString("en-EN",{style:"currency", currency:"USD"})});
    });
    $scope.getGoogleData();
   }).error(function (err, data){if(err)throw err; console.log(data);});
  $scope.map = {
   center: {
    latitude: address.lat,
    longitude: address.lng
   },
   zoom:8
  };
  $scope.$watch('active', function () {
   window.setTimeout(function(){
    google.maps.event.trigger(map, 'resize');
   },100);
  });
 }
 $scope.getAddr = function (addr) {
  $scope.addresses = [];
  hasAddr = false;
  $scope.lat = undefined;
  $http.get('/api/geocode/' + encodeURIComponent(addr))
   .success(function (data) {
    hasAddr = true;
    data.forEach(function (ele, index, data){
     $scope.addresses.push(
      {'address' : ele.formatted_address,
       'location' : ele.geometry.location,
       'lat' : ele.geometry.location.lat,
       'lng' : ele.geometry.location.lng
      });
    })
    if (data.length === 1) {
     $scope.setAddress($scope.addresses[0]);
    }
   }).error(function (data) {
    $scope.googleDataLoaded=false;
    $scope.addresses = [];
    $scope.address = undefined;
    $scope.location = undefined;
    $scope.lat = undefined;
    $scope.lng = undefined;
    $scope.zipsData = [];
    $scope.map = {
     center: {
      latitude: 0,
      longitude: 0
     },
     zoom:8
    };
    console.log(data);
  });
 };
 $scope.googleDataLoaded=false;
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
  zoom:8
 };
});


angular.module('directives', []).directive('map', function() {
 var map;
 var infoWindow;
 return {
  restrict: 'E',
  replace: true,
  template: '<div></div>',
  link: function($scope, element, attrs) {
   $scope.$watch('mapVisible',function(resize){
    var center = new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude);
    var map_options = {
     zoom: $scope.getZoom(),
     center: center,
     mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // create map
    var map = new google.maps.Map(document.getElementById(attrs.id), map_options);
    google.maps.event.addListener(map, 'mouseup', function() {
     var center = map.getCenter();
     var addr = {
      lat: center.d,
      lng: center.e,
      address: 'lat: '+ center.d + ', long: ' + center.e,
      location:[center.d, center.e]
     }
     $scope.setAddress(addr);
     google.maps.event.trigger(map, 'resize');
     $scope.selected = 'grid';
    });
    google.maps.event.addListener(map, 'zoom_changed', function() {
     var zoomLevel = map.getZoom();
     var center = map.getCenter();
     var addr = {
      lat: center.d,
      lng: center.e,
      address: 'lat: '+ center.d + ', long: ' + center.e,
      location:[center.d, center.e]
     }
     $scope.setZoom(zoomLevel);
     $scope.setAddress(addr);
     google.maps.event.trigger(map, 'resize');
     $scope.selected = 'grid';
    });
    if(resize){
     center = new google.maps.LatLng($scope.map.center.latitude, $scope.map.center.longitude);
     google.maps.event.trigger(map, 'resize');
     setTimeout(map.setCenter(center), 10);
     var marker_options = {
      map: map,
      position: center,
      title: $scope.address
     };

     // create marker
     var marker = new google.maps.Marker(marker_options);
     var colorRed = 255;
     var colorGreen = 100;
     var colorBlue = 100;
     $scope.zipsData.forEach(function (ele, idx, blah) {
      if(ele.geometry[0].length) {
       var path = []
       ele.geometry.forEach(function(e, i, a){
        path.push(new google.maps.LatLng(e[0],e[1]));
       })
       path.push(new google.maps.LatLng(ele.geometry[0][0],ele.geometry[0][1]));
       cRed = Math.floor(colorRed * ele.pct);
       cGreen =  Math.floor(colorGreen * ele.pct);
       cBlue =  Math.floor(colorBlue * ele.pct);
       var zipBound = new google.maps.Polygon({
        paths: path,
        strokeColor:'#' + cRed.toString(16)+ cGreen.toString(16)+ cBlue.toString(16),
        strokeWeight:2,
        fillColor:'#' + cRed.toString(16)+ cGreen.toString(16)+ cBlue.toString(16),
        fillOpacity:0.40
       });
       zipBound.setMap(map);
       // Add a listener for the click event.
       google.maps.event.addListener(zipBound, 'click', function(event){ showArrays(event, ele)});
       infoWindow = new google.maps.InfoWindow();
      }
     });
    }
   });
   /** @this {google.maps.Polygon} */
   function showArrays(event,ele) {
     console.log(ele);
     var contentString = '<b>City:</b><br>';
     // Replace the info window's content and position.
     infoWindow.setContent(contentString);
     infoWindow.setPosition(event.latLng);
   
     infoWindow.open(map);
   }
   $scope.$watch('selected', function () {
    $scope.mapVisible=($scope.selected == 'map');
   });
  }
 }
});


