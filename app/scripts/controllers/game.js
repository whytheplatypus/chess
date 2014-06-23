'use strict';

angular.module('chessApp')
  .controller('GameCtrl', ["$scope", "$routeParams", "$sce", function ($scope, $routeParams, $sce) {
    var my_video;
    var im_host = $routeParams.joining!="true";
    if(im_host){
      $scope.link = window.location.href+"?joining=true";
      $scope.invite_subject = window.encodeURI("Come play chess with me");
      $scope.invite_body = $scope.link;
    }
    $scope.im_host = im_host;


    console.log($routeParams);
    var channel = false;
    $scope.color = $routeParams.joining=="true"?"b":"w";
    var id = $routeParams.joining=="true"?$routeParams.id+"_opponent":$routeParams.id;
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
    var host = 'relay.whytheplatypus.technology'
    // var host = "localhost"
          ,port = 80;
    var me = new Exchange(id);
    var peerjsServer = 'ws://' + host + ':' + port + '/?id='+me.id;
    console.log(peerjsServer);
    me.on('peers', function(eventname, peers){
      console.log("peers", peers);
      // for(var i = 0; i < peers.length; i++){
      //   var manager = me.connect(peers[i])
      //   var dc = manager.createDataChannel(manager.peer, {reliable : true, protocol: "draw"});
      //   dc.onopen = function(){
      //     // me.addDC(dc, peer);
      //     console.log(dc);
      //   }
      // }
    });
    me.on('peer', function(eventName, peerManager){
      // alert("peer!");

      if(peerManager.label == "video"){
        peerManager.pc.onaddstream = function(obj) {
          console.log("test");
          // alert("test");
          console.log(obj);
          // var video = document.createElement("video");
          // document.body.appendChild(video);
          // video.src = window.URL.createObjectURL(obj.stream);
          // video.play();

          $scope.stream = $sce.trustAs($sce.RESOURCE_URL, window.URL.createObjectURL(obj.stream));
          $scope.$apply();
          peerManager.pc.addStream(my_video);
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
            channel = e.channel;

          };

        }
      }
      console.log("connected from outside", arguments);
    });
    me.initWS(peerjsServer, protocol);
    if($routeParams.joining == "true"){
      setTimeout(function(){
          var game_manager = me.connect($routeParams.id);
          console.log("host:", $routeParams.id);
          var dc = game_manager.createDataChannel(game_manager.peer, {reliable : true, protocol: "draw"});
          dc.onopen = function(){
            console.log("open", arguments);
            channel = dc;
            // me.addDC(dc, manager.peer);
            console.log(dc);
            dc.onmessage = function(message){
              console.log(message);
              var move = JSON.parse(message.data);
              console.log(move);
              $scope.chess.move(move);
              $scope.$apply();
            }

/*
            navigator.getUserMedia({video: true, audio:true}, function(stream) {
              // my_video = stream;
              // console.log("stream", window.URL.createObjectURL(stream));
              $scope.local_stream = $sce.trustAs($sce.RESOURCE_URL, window.URL.createObjectURL(stream));
              $scope.$apply();
              var id = $routeParams.joining=="true"?$routeParams.id:$routeParams.id+"_opponent"
              // var video_manager = me.connect(id);
              // video_manager.pc.onaddstream = function(obj) {
              //   console.log("test");
              //   var video = document.createElement("video");
              //   document.body.appendChild(video);
              //   video.src = window.URL.createObjectURL(obj.stream);
              //   video.play();
              // }
              // video_manager.createVideoChannel(stream);
              // if(the_manager){
              //   the_manager.pc.addStream(stream);
              // }
              manager.pc.addStream(stream);
            }, function(error){console.log(error)});
*/
          }



      }, 1000);
    }


    $scope.connections = [];

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
  		if($scope.square !== undefined && $scope.chess.turn() == $scope.color && channel){
        var move_json = { from: $scope.square, to: square };
        var move = $scope.chess.move(move_json);
        console.log(move);
        channel.send(JSON.stringify(move_json));

  		}

  		$scope.square = square;
  	}

    navigator.getUserMedia({video: true, audio:true}, function(stream) {
      my_video = stream;
      $scope.local_stream = $sce.trustAs($sce.RESOURCE_URL, window.URL.createObjectURL(stream));
      $scope.$apply();
    }, console.log);

    $scope.startVideoChat = function(){
      var id = $routeParams.joining=="true"?$routeParams.id:$routeParams.id+"_opponent"
      var video_manager = me.connect(id, "video");
      video_manager.createVideoChannel(my_video);
      video_manager.pc.onaddstream = function(obj) {
        console.log("got a stream back");
        // var video = document.createElement("video");
        // document.body.appendChild(video);
        // video.src = window.URL.createObjectURL(obj.stream);
        // video.play();
        $scope.stream = $sce.trustAs($sce.RESOURCE_URL, window.URL.createObjectURL(obj.stream));
        $scope.$apply();
      }
    }
  }]);
