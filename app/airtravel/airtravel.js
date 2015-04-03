'use strict';

angular.module('myApp.airTravel', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/airTravel', {
    templateUrl: 'airTravel/airTravel.html',
    controller: 'airTravelCtrl'
  });
}])

.controller('airTravelCtrl', ['$scope', function($scope) {
  $scope.data = 'airports'
}]);
