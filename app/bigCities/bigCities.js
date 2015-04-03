'use strict';

angular.module('myApp.bigCities', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/bigCities', {
    templateUrl: 'bigCities/bigCities.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', ['$scope', function($scope) {
  $scope.data = 'something else entirely'
}]);
