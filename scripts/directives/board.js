angular.module('chessApp')
.directive('board', [function() {

  function link(scope, element, attrs) {

    var board;
    var game = scope.game;

    var removeGreySquares = function() {
      $('.square-55d63').css('background', '');
    };

    var greySquare = function(square) {
      var squareEl = $('.square-' + square);
      console.log(squareEl);
      var background = '#a9a9a9';
      if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
      }

      squareEl.css('background', background);
    };

    var onDragStart = function(source, piece) {
      //grey squares for mobile
      onMouseoverSquare();
      // do not pick up pieces if the game is over
      // or if it's not that side's turn
      if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (scope.side === 'white' && piece.search(/^b/) !== -1) ||
        (scope.side === 'black' && piece.search(/^w/) !== -1)) {
          return false;
        }
      };

      var onDrop = function(source, target) {
        removeGreySquares();

        // see if the move is legal
        var move = game.move({
          from: source,
          to: target,
          promotion: 'q' // NOTE: always promote to a queen for example simplicity
        });

        // illegal move
        if (move === null) return 'snapback';
        scope.onMove(move);
      };

      var onMouseoverSquare = function(square, piece) {
        // get list of possible moves for this square
        var moves = game.moves({
          square: square,
          verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);
        console.log(square);
        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
          greySquare(moves[i].to);
        }
      };

      var onMouseoutSquare = function(square, piece) {
        removeGreySquares();
      };

      var onSnapEnd = function() {
        board.position(game.fen());
      };

      //poll for updates
      setInterval(function(){
        board.position(scope.game.fen());
      }, 1000)

      var cfg = {
        orientation: scope.side,
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd,
        pieceTheme: '/bower_components/chessboardjs/img/chesspieces/wikipedia/{piece}.png'
      };
      board = new ChessBoard(element, cfg);
  }

  return {
    restrict: 'E',
    link: link,
    scope: {
      'game': "=",
      'onMove': '=',
      'side': '='
    },
  };
}]);
