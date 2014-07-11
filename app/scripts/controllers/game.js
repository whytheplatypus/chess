'use strict';

angular.module('chessApp')
  .controller('GameCtrl', ["$scope", "$routeParams", "$sce", function ($scope, $routeParams, $sce) {
    var im_host = $routeParams.joining != "true";
    $scope.im_host = im_host;
    $scope.channel = false;
    $scope.color = im_host?"b":"w";
    if(im_host){
      $scope.link = window.location.href+"?joining=true";
      $scope.invite_subject = window.encodeURI("Come play chess with me");
      $scope.invite_body = $scope.link;
    }

    var id = !im_host?$routeParams.id+"_opponent":$routeParams.id;

    var host = 'relay.whytheplatypus.technology' ,port = 80;
    var me = new Exchange(id);
    var peerjsServer = 'ws://' + host + ':' + port + '/?id='+me.id;

    me.on('peer', function(eventName, peerManager){
      console.log("peer!");

      if(peerManager.label != "base"){
        peerManager.pc.onaddstream = function(obj) {
          $scope.stream = $sce.trustAs($sce.RESOURCE_URL, window.URL.createObjectURL(obj.stream));
          $scope.$apply();
        }
      } else {
        peerManager.pc.ondatachannel = function(e){
          console.log("new data channel");
          e.channel.onopen = function(){

            console.log("open", arguments);
            e.channel.onmessage = function(message){
              console.log(message);
              var move = JSON.parse(message.data);
              console.log(move);
              $scope.chess.move(move);
              $scope.$apply();
            }
            document.getElementById('invite_modal').opened = false;
            $scope.channel = e.channel;
            $scope.$apply();
          };

        }
      }
      console.log("connected from outside", arguments);
    });


    me.initWS(peerjsServer, {
          to: 'to',
          from: 'from',
          type: 'type',
          payload: 'payload',
          ignore: '',
          offer: 'OFFER',
          answer: 'ANSWER',
          candidate: 'CANDIDATE',
          port: 'PORT'
      });




    var connect = function(){
      var game_manager = me.connect($routeParams.id);
      var dc = game_manager.createDataChannel(game_manager.peer, {reliable : true, protocol: "draw"});
      dc.onopen = function(){
        $scope.channel = dc;
        $scope.$apply();
        document.getElementById('invite_modal').opened = false;
        dc.onmessage = function(message){
          var move = JSON.parse(message.data);
          $scope.chess.move(move);
          $scope.$apply();
        }
      }
    }

    $scope.startVideoChat = function(){
      var id = $routeParams.joining=="true"?$routeParams.id:$routeParams.id+"_opponent"
      var video_manager = me.connect(id, id+"video");
      navigator.requestCamera({video: true, audio:true})
      .then(function(stream){
        $scope.local_stream = stream;
        video_manager.createVideoChannel(stream);
        $scope.$apply();
        return stream;
      })
      .catch(function(error) {
        console.log("Failed!", error);
      });
    }

//Chess logic
    $scope._ = _;
    $scope.board = {
      a: [8,7,6,5,4,3,2,1],
      b: [8,7,6,5,4,3,2,1],
      c: [8,7,6,5,4,3,2,1],
      d: [8,7,6,5,4,3,2,1],
      e: [8,7,6,5,4,3,2,1],
      f: [8,7,6,5,4,3,2,1],
      g: [8,7,6,5,4,3,2,1],
      h: [8,7,6,5,4,3,2,1]
    };
    $scope.chess = setupChess(new Chess());
    $scope.square;
    $scope.selectPiece = function(square){
      console.log(square);
      var moves = $scope.chess.moves({square: square, verbose: true});
      $scope.moves = _.pluck(moves, 'to');
      if($scope.square !== undefined && $scope.chess.turn() == $scope.color && $scope.channel){
        var move_json = { from: $scope.square, to: square };
        var move = $scope.chess.move(move_json);
        console.log(move);
        $scope.channel.send(JSON.stringify(move_json));

      }

      $scope.square = square;
    }

    $scope.invite = function(){
      document.getElementById('invite_modal').toggle();
    }

    if($routeParams.joining == "true"){
      setTimeout(connect, 1000);
    }

  }]);
