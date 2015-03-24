'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]).
directive('myCurrentTime', ['$interval', 'dateFilter', function($interval, dateFilter) {
  function link(scope, element, attrs) {
    var format,
        timeoutId;
    function updateTime() {
      element.text(dateFilter(new Date(), format));
    }

    scope.$watch(attrs.myCurrentTime, function(value) {
      format = value;
      updateTime();
    });

    element.on('$destroy', function() {
      $interval.cancel(timeoutId);
    });
    // start the UI update process; save the timeoutId for canceling
    timeoutId = $interval(function() {
      updateTime(); // update DOM
    }, 1000);
  }
  return {
    link: link
  };
}]).
directive('azimuthalMap', ['$rootScope', function($rootScope) {
  var width = 1280,
    height = 800,
    centered,
    cityAirportData,
    feature;

  var projection = d3.geo.azimuthal()
      .scale(380)
      .origin([-71.03,42.37])
      .mode("orthographic")
      .translate([640, 400]);

  var circle = d3.geo.greatCircle()
      .origin(projection.origin());

  var scale = {
    orthographic: 380,
    stereographic: 380,
    gnomonic: 380,
    equidistant: 380 / Math.PI * 2,
    equalarea: 380 / Math.SQRT2
  };

  var path = d3.geo.path()
      .projection(projection);

  $rootScope.path = path;

  var svg = d3.select(".map").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .on("mousedown", mousedown);

  $rootScope.svg = svg;

  var m0,
      o0;

  function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = projection.origin();
    d3.event.preventDefault();
  }

  return {
    restrict: 'E',
    scope: {
      data: '=',
    },
    link: function(scope, element, attrs) {
      // Groups
      var geoGroup = svg.append("g").attr("id", "geo-paths")

      // Draw the world
      d3.json("data/world-countries.json", function(collection) {
        feature = geoGroup.selectAll("path").data(collection.features).enter().append("svg:path")
          .attr("d", clip)
          .on("click", clicked);

        feature.append("svg:title")
            .text(function(d) { return d.properties.name; });
      });

      d3.select(window)
          .on("mousemove", mousemove)
          .on("mouseup", mouseup);

      d3.select("select").on("change", function() {
        projection.mode(this.value).scale(scale[this.value]);
        refresh(750);
      });

      // MOVE THE WORLD AROUND
      function mousemove() {
        if (m0) {
          var m1 = [d3.event.pageX, d3.event.pageY],
              o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
          projection.origin(o1);
          circle.origin(o1)
          refresh();
        }
      }

      function mouseup() {
        if (m0) {
          mousemove();
          m0 = null;
        }
      }

      function refresh(duration) {
        (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
      }

      function clip(d) {
        return path(circle.clip(d));
      }

      $rootScope.clip = clip;

      // This should get re-written when data enters the picture
      function clicked(d) {
        var x, y, k;

        if (d && centered !== d) {
          var centroid = path.centroid(d);
          x = centroid[0];
          y = centroid[1];
          k = 4;
          centered = d;
        } else {
          x = width / 2;
          y = height / 2;
          k = 1;
          centered = null;
        }
        var allPaths = d3.selectAll('path')
        allPaths.classed("active", centered && function(d) { return d === centered; });

        allPaths.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
      }
    }
  };
}]);
