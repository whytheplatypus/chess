'use strict';

angular.module('chessApp')
  .controller('GameCtrl', ["$scope", "$routeParams", "$sce", function ($scope, $routeParams, $sce) {
    $scope.game = new Chess();

    var game_check = function(){
      if($scope.game.in_check()){
        document.querySelector('#check').show();
      } else if($scope.game.game_over()){
        document.querySelector('#game_over').show();
      }
    }

    $scope.onMove = function(move){
      $scope.channel.send(JSON.stringify(move));
      game_check();
    };
    $scope.side = $routeParams.color
    $scope.invite_link = window.location.href.replace('white', 'black');


    var id = $routeParams.color === 'black'?$routeParams.id+"_opponent":$routeParams.id;
//
    var host = 'relay.whytheplatypus.technology' ,port = 80;
    var me = new Exchange(id);
    var relay_server = 'ws://' + host + ':' + port + '/?id='+me.id;
    var protocol = {
      to: 'to',
      from: 'from',
      type: 'type',
      payload: 'payload',
      ignore: '',
      offer: 'OFFER',
      answer: 'ANSWER',
      candidate: 'CANDIDATE',
      port: 'PORT'
    };

    var ws = me.initServer(relay_server, protocol);
    ws.promise.then(function(){
      me.on('pre:data', function(name, data){
        console.log(data);
        if(data.peers)
          throw "we're ignoring the graph for now";
      });
    });

    me.on('peer', function(eventName, peerManager){
      peerManager.pc.ondatachannel = function(e){
        console.log("new data channel");
        e.channel.onopen = function(){

          console.log("open", arguments);
          e.channel.onmessage = function(message){
            console.log(message);
            var move = JSON.parse(message.data);
            console.log(move);
            $scope.game.move(move);

            if(!$scope.$$phase){
              $scope.$apply();
            }
          }
          // document.getElementById('invite_modal').opened = false;
          $scope.channel = e.channel;
          if(!$scope.$$phase){
            $scope.$apply();
          }
        };

      }
      console.log("connected from outside", arguments);
    });

    var connect = function(){
      var dc = me.openPipe($routeParams.id, {reliable : true});
      // console.log(dc);
      dc.promise.then(function(){
        $scope.channel = dc;
        if(!$scope.$$phase){
          $scope.$apply();
        }
        dc.onmessage = function(message){
          var move = JSON.parse(message.data);
          $scope.game.move(move);
          game_check();
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
      });
    }

    if($routeParams.color == "black"){
      setTimeout(connect, 1000);
    }

  }]);
