'use strict';

angular.module('chessApp')
  .controller('GameCtrl', ["$scope", "$routeParams", "$sce", function ($scope, $routeParams, $sce) {
    navigator.getUserMedia({video: true, audio:true}, function(stream) {
        console.log("stream", window.URL.createObjectURL(stream));
        $scope.local_stream = $sce.trustAs($sce.RESOURCE_URL, window.URL.createObjectURL(stream));
        $scope.$apply();
    }, function(error){console.log(error)});

    console.log($routeParams);
    var channel = false;
    $scope.color = $routeParams.joining=="true"?"b":"w";
    var id = $routeParams.joining=="true"?$routeParams.id+"_opponent":$routeParams.id
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
      peerManager.pc.ondatachannel = function(e){
        console.log("new data channel");
        e.channel.onopen = function(){
          alert("connection from outside");
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

      console.log("connected from outside", arguments);
    });
    me.initWS(peerjsServer, protocol);
    setTimeout(function(){
      if($routeParams.joining == "true"){
        console.log("host:", $routeParams.id);
        var manager = me.connect($routeParams.id)
        var dc = manager.createDataChannel(manager.peer, {reliable : true, protocol: "draw"});

        dc.onopen = function(){
          console.log("open", arguments);
          channel = dc;
          // me.addDC(dc, peer);
          console.log(dc);
          dc.onmessage = function(message){
            console.log(message);
            var move = JSON.parse(message.data);
            console.log(move);
            $scope.chess.move(move);
            $scope.$apply();
          }
        }
      }
    }, 1000);


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
  }]);
