function mapAirports(scope) {
  // AIRPORTS
  var citiesGroup = scope.svg.append("g").attr("id", "cities")

  // Tooltips for airports
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) { return d.city });
  scope.svg.call(tip);

  d3.csv("data/citiesTable-updated.csv", function(cities) {
    for (var i = 0; i < cities.length; i++) {
      var city = cities[i]
      city.lat = parseFloat(city['lat. most active airport'])
      city.lon = parseFloat(city['long. most active airport'])
      city.centroid = [+city.lon, +city.lat]
      city.totalRoutes = parseInt(city['number of routes'])
    }

    cityAirportData = cities;

    var routesCounts = cities.map(function(city) { return city.totalRoutes }).sort()
    var airportsScale = d3.scale.linear()
        .domain([d3.min(routesCounts), d3.max(routesCounts)])
        .range([1,20]);

    cities.forEach(function(d) {
        citiesGroup.append('path')
          .datum({type: 'Point', coordinates: [d.lon, d.lat], city: d['city name'], totalRoutes: d.totalRoutes })
          .attr("class", "airport")
          .attr("opacity", 0.7)
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .on("click", chartFlights)
          .attr("d", scope.path.pointRadius(function(d) { return airportsScale(d.totalRoutes) }))
          .attr("d", scope.clip)
    })
  });

  // ROUTES
  var routesGroup = scope.svg.append("g").attr("id", "routes-group")

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

    //var routeArcs = routesGroup.selectAll('.arc').data(routeEdges)
    var routes = routesGroup.selectAll('.arc').data(routeEdges)
    routes.enter()
        .append("path")
        .attr({'class': 'arc'})
        .attr({d: scope.clip})
        .style({
          'fill': 'none',
          'stroke': 'lightblue',
          'stroke-width': '1px'
        })
        .on("mouseover", activeRoute)
        .on("mouseout", deactivateRoute)
        .on("click", function(d) {
          $('.fare').html('fetching fare...')
          findCheapest(d.originCode, d.destinationCode) 
        })
  }

  var chartFlights = function(city) {
    routesGroup.selectAll('.arc').remove()
    routeEdges = []
    chartIntlFlights(city.city)
  }

  function chartIntlFlights(cityName) {
    // Get the city
    var originCity = _.find(cityAirportData, function(city) { return city['city name'] == cityName })

    d3.json('data/intl-routes.json', function(data) {
      var internationalRoutes = data[originCity.airportCode]['international']
      $.each(internationalRoutes, function(code, numFlights) {
        var destinationCity = _.find(cityAirportData, function(city) { return city.airportCode == code})
        if (destinationCity) { 
          drawRoute(originCity, destinationCity)
        }
      })
    })
  }
}
