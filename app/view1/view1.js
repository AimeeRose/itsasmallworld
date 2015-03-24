'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.format = 'M/d/yy h:mm:ss a';
  $scope.drawAirportData = function() {
    var citiesGroup = $rootScope.svg.append("g").attr("id", "cities")
    var routesGroup = $rootScope.svg.append("g").attr("id", "routes-group")

    // Tooltips for cities
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) { return d.city });
    $rootScope.svg.call(tip);

    d3.csv("data/citiesTable-updated.csv", function(cities) {
      for (var i = 0; i < cities.length; i++) {
        var city = cities[i]
        city.lat = parseFloat(city['lat. most active airport'])
        city.lon = parseFloat(city['long. most active airport'])
        city.centroid = [+city.lon, +city.lat]
        city.totalRoutes = parseInt(city['number of routes'])
      }

      var cityAirportData = cities;

      var routesCounts = cities.map(function(city) { return city.totalRoutes }).sort()
      var airportsScale = d3.scale.linear()
          .domain([d3.min(routesCounts), d3.max(routesCounts)])
          .range([1,20]);

      // Paths option
      cities.forEach(function(d) {
          citiesGroup.append('path')
            .datum({type: 'Point', coordinates: [d.lon, d.lat], city: d['city name'], totalRoutes: d.totalRoutes })
            .attr("class", "airport")
            .attr("opacity", 0.7)
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
            //.on("click", chartFlights)
            .attr("d", $rootScope.path.pointRadius(function(d) { return airportsScale(d.totalRoutes) }))
            .attr("d", $rootScope.clip)
      })
    });
  };

  $scope.drawAirportData()
}]);