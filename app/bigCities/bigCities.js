'use strict';

angular.module('myApp.bigCities', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/bigCities', {
    templateUrl: 'bigCities/bigCities.html',
    controller: 'BigCitiesCtrl'
  });
}])

.controller('BigCitiesCtrl', ['$scope', function($scope) {
  $scope.data = 'populations'
}]);
