'use strict';

angular.module('chessApp')
  .controller('GameCtrl', ["$scope", "$routeParams", function ($scope, $routeParams) {
    console.log($routeParams);
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
        e.channel.onmessage = function(message){
          var move = JSON.parse(message.data);
          console.log(move);
        }
      }
      alert("connection from outside");
      console.log("connected from outside", arguments);
    });
    me.initWS(peerjsServer, protocol);
    setTimeout(function(){
      if($routeParams.joining == "true"){
        console.log("host:", $routeParams.id);
        var manager = me.connect("763npbkrv")
        var dc = manager.createDataChannel(manager.peer, {reliable : true, protocol: "draw"});
        dc.onopen = function(){
          // me.addDC(dc, peer);
          console.log(dc);
          dc.onmessage = function(message){
            var move = JSON.parse(message.data);
            console.log(move);
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
  		if($scope.square !== undefined){
  			console.log($scope.chess.move({ from: $scope.square, to: square }));
  		}

  		$scope.square = square;
  	}
  }]);
