/* Chess 
 * By Dave Fowler
 */

/* Note, all functions are tacked on to the instance instead of the class prototype because of the odd way chess.js does objects. */
//var chess = new Chess();


/* Utility Functions */
_.mixin({
	// same as _.range but returns the alphabetic equivalent
	alphaRange: function(start, stop) {
		var alpha = "abcdefghijklmnopqrstuvwxyz";
		return _.map(_.range(start, stop), function(i) { return alpha[i] });
	},
	// return a string with the first instance of the character replaced
	removeFirst: function(str, c) {
		var i = str.indexOf(c);
		return str.slice(0, i) + str.slice(i+1, str.length);
	},
	// a boolean of whether a character is upper case
	isUpperCase: function(c) {
		return c == c.toUpperCase();
	},
	tally: function(arr) {
		var r = {};
		_.each(arr, function(c) { 
			r[c] = r[c] ? r[c] + 1 : 1;
		});
		return r;
	},
});

/* END Utility Functions */
function setupChess(chess){
    //var chess = chess;

    chess.symbols = {'w': 
                     {'k': '&#9812;', 
                      'q': '&#9813;',
                      'r': '&#9814;',
                      'b': '&#9815;',
                      'n': '&#9816;',
                      'p': '&#9817;',
                     },
                     'b':
                     {'k': '&#9818;',
                      'q': '&#9819;',
                      'r': '&#9820;',
                      'b': '&#9821;',
                      'n': '&#9822;',
                      'p': '&#9823;',
                     }
                    }

    // Return the fen characters for the peices that are dead
    chess.dead_fen = function() {
        var dead = 'rnbqkbnrppppppppPPPPPPPPRNBQKBNR';
    
        var pieces = fen_pieces(chess);
        _.each(_.toArray(pieces), function(piece) {
            dead = _.removeFirst(dead, piece);
        });
        return dead;
    }

    chess.dead = function() {
        var dead = {'w': [], 'b': []};
        _.map(_.toArray(this.dead_fen()), function(piece) {
            var color = _.isUpperCase(piece) ? 'w' : 'b';
            dead[color].unshift(chess.symbols[color][piece.toLowerCase()]);
        });
        return dead;
    }
    
    return chess;
}
