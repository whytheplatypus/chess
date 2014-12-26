'use strict';

angular.module('chessApp')
  .controller('GameCtrl', ["$scope", "$routeParams", "$sce", function ($scope, $routeParams, $sce) {
    $scope.game = new Chess();
    $scope.onMove = function(move){
      $scope.channel.send(JSON.stringify(move));
    };
    $scope.invite_link = window.location.href.replace('white', 'black');
//     var im_host = $routeParams.joining != "true";
//     $scope.im_host = im_host;
//     $scope.channel = false;
//     $scope.color = im_host?"b":"w";
//     if(im_host){
//       $scope.link = window.location.href+"?joining=true";
//       $scope.invite_subject = window.encodeURI("Come play chess with me");
//       $scope.invite_body = $scope.link;
//     }

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
//
//
//     me.initWS(peerjsServer, {
//           to: 'to',
//           from: 'from',
//           type: 'type',
//           payload: 'payload',
//           ignore: '',
//           offer: 'OFFER',
//           answer: 'ANSWER',
//           candidate: 'CANDIDATE',
//           port: 'PORT'
//       });
//
//
//
//
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
          if(!$scope.$$phase){
            $scope.$apply();
          }
        }
      });
      // var game_manager = me.connect($routeParams.id);
      // var dc = game_manager.createDataChannel(game_manager.peer, {reliable : true, protocol: "draw"});
      // dc.onopen = function(){
      //   $scope.channel = dc;
      //   $scope.$apply();
      //   document.getElementById('invite_modal').opened = false;
      //   dc.onmessage = function(message){
      //     var move = JSON.parse(message.data);
      //     $scope.chess.move(move);
      //     $scope.$apply();
      //   }
      // }
    }
//
//     $scope.startVideoChat = function(){
//       var id = $routeParams.joining=="true"?$routeParams.id:$routeParams.id+"_opponent"
//       var video_manager = me.connect(id, id+"video");
//       navigator.requestCamera({video: true, audio:true})
//       .then(function(stream){
//         $scope.local_stream = stream;
//         video_manager.createVideoChannel(stream);
//         $scope.$apply();
//         return stream;
//       })
//       .catch(function(error) {
//         console.log("Failed!", error);
//       });
//     }
//
// //Chess logic
//     $scope._ = _;
//     $scope.board = {
//       a: [8,7,6,5,4,3,2,1],
//       b: [8,7,6,5,4,3,2,1],
//       c: [8,7,6,5,4,3,2,1],
//       d: [8,7,6,5,4,3,2,1],
//       e: [8,7,6,5,4,3,2,1],
//       f: [8,7,6,5,4,3,2,1],
//       g: [8,7,6,5,4,3,2,1],
//       h: [8,7,6,5,4,3,2,1]
//     };
//     $scope.chess = setupChess(new Chess());
//     $scope.square;
//     $scope.selectPiece = function(square){
//       console.log(square);
//       var moves = $scope.chess.moves({square: square, verbose: true});
//       $scope.moves = _.pluck(moves, 'to');
//       if($scope.square !== undefined && $scope.chess.turn() == $scope.color && $scope.channel){
//         var move_json = { from: $scope.square, to: square };
//         var move = $scope.chess.move(move_json);
//         console.log(move);
//         $scope.channel.send(JSON.stringify(move_json));
//
//       }
//
//       $scope.square = square;
//     }
//
//     $scope.invite = function(){
//       document.getElementById('invite_modal').toggle();
//     }
//
    if($routeParams.color == "black"){
      setTimeout(connect, 1000);
    }

  }]);
