'use strict';

angular.module('myApp.airTravel', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/airTravel', {
    templateUrl: 'airTravel/airTravel.html',
    controller: 'airTravelCtrl'
  });
}])

.controller('airTravelCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
  $scope.format = 'M/d/yy h:mm:ss a';
  $scope.drawAirportData = function() {
    var citiesGroup = $rootScope.svg.append("g").attr("id", "cities")
    var routesGroup = $rootScope.svg.append("g").attr("id", "routes-group")
    $rootScope.citiesGroup = citiesGroup
    $rootScope.routesGroup = routesGroup

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
      $rootScope.cityAirportData = cityAirportData;
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
            .attr("d", $rootScope.path.pointRadius(function(d) { return airportsScale(d.totalRoutes) }))
            .attr("d", $rootScope.clip)
      })

      $scope.drawInternationalRoutes();
    });
  };

  $scope.drawInternationalRoutes = function() {
    var routeTip = function(origin, destination) {
      $('span.route-span').empty()
      $('span.route-span').html(origin + ' - ' + destination)
      if ($('#routes-div').is(":hidden")) { $('#routes-div').show() }
    }

    var activeRoute = function() {
      var routePath = d3.select(this)
      var routeData = routePath[0][0].__data__
      routeTip(routeData.origin, routeData.destination)
      routePath.style({'stroke': 'orange'})
    }

    var deactivateRoute = function() {
      d3.select(this).style({'stroke': 'lightblue '})
      $('.fare').html('Click route to retrieve non-stop fare.')
      $('#routes-div').hide()
    }

    var routeEdges = []
    // These should be city objects as stored in cityAirportData
    function drawRoute(origin, destination) {
      if (origin && destination) {
        routeEdges.push({
          type: "LineString",
          coordinates: [
              [ origin.lon, origin.lat ],
              [ destination.lon, destination.lat ]
          ],
          origin: origin['city name'],
          destination: destination['city name'],
          originCode: origin.airportCode,
          destinationCode: destination.airportCode
        })
      }

      var routes = $rootScope.routesGroup.selectAll('.arc').data(routeEdges)
      routes.enter()
          .append("path")
          .attr({'class': 'arc'})
          .attr({d: $rootScope.clip})
          .style({
            'fill': 'none',
            'stroke': 'lightblue',
            'stroke-width': '1px'
          })
          .on("mouseover", activeRoute)
          .on("mouseout", deactivateRoute)
          .on("click", function(d) {
            //$('.fare').html('fetching fare...')
            //findCheapest(d.originCode, d.destinationCode) 
          })
    }

    var chartFlights = function(city) {
      $rootScope.routesGroup.selectAll('.arc').remove()
      routeEdges = []
      chartIntlFlights(city.city)
    }

    function chartIntlFlights(cityName) {
      // Get the city
      var originCity = _.find($rootScope.cityAirportData, function(city) { return city['city name'] == cityName })

      d3.json('data/routes.json', function(data) {
        var internationalRoutes = data[originCity.airportCode]['international']
        _.each(internationalRoutes, function(numFlights, code) {
          var destinationCity = _.find($rootScope.cityAirportData, function(city) { return city.airportCode == code})
          if (destinationCity) { 
            drawRoute(originCity, destinationCity)
          }
        })
      })
    }

    // Get all the cities and add an event handler to chartFlights
    d3.selectAll('#cities path').on("click", function(d) { chartFlights(d) })
  }

  $scope.drawAirportData()
}]);
