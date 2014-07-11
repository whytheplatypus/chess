'use strict';

angular.module('chessApp')
  .controller('MainCtrl', function ($scope) {
    $scope.uniq =  Math.random().toString(36).substr(2, 9);
    $scope.paper_modal = function(id, event){
      event.preventDefault();
      document.getElementById(id).toggle();
    }
  });
