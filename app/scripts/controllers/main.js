'use strict';

angular.module('chessApp')
  .controller('MainCtrl', function ($scope) {
    $scope.uniq =  Math.random().toString(36).substr(2, 9);
  });
