'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.airTravel',
  'myApp.bigCities',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/airTravel'});
}]).
directive('azimuthalMap', ['$rootScope', function($rootScope) {
  function link(scope, element, attrs) {
    azimuthalMap($rootScope)

    scope.$watch(attrs.azimuthalMap, function(value) {
      if (value == 'airports') {
        mapAirports($rootScope)
      }
    });
  }

  return {
    link: link
  }
}]).
directive('bigCities', ['$rootScope', function($rootScope) {
  function link(scope, element, attrs) {
    chartCities($rootScope)

    scope.$watch(attrs.cityData, function(value) {
      if (value == 'populations') {
        //mapAirports($rootScope)
      }
    });
  }

  return {
    link: link
  }
}]);
