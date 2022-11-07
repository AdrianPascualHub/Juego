(function () {

    'use strict';
  
    /**
    * Esto es una funcion para buscar palabras 
    * Detecta automaticamente las palabras y ajusta el puzzle.
    */
  
    /**
    * Initializes the WordFind object.
    *
    * @api private
    */
    var WordFind = function () {
  
      //Abecedario
      var letters = 'abcdefghijklmnñoprstuvwy';
  
      
  
      // Lista de todas las posibles orientaciones
      var allOrientations = ['horizontal','horizontalBack','vertical','verticalUp',
                             'diagonal','diagonalUp','diagonalBack','diagonalUpBack'];
  
      // Definiciones orientaciones
      var orientations = {
        horizontal:     function(x,y,i) { return {x: x+i, y: y  }; },
        horizontalBack: function(x,y,i) { return {x: x-i, y: y  }; },
        vertical:       function(x,y,i) { return {x: x,   y: y+i}; },
        verticalUp:     function(x,y,i) { return {x: x,   y: y-i}; },
        diagonal:       function(x,y,i) { return {x: x+i, y: y+i}; },
        diagonalBack:   function(x,y,i) { return {x: x-i, y: y+i}; },
        diagonalUp:     function(x,y,i) { return {x: x+i, y: y-i}; },
        diagonalUpBack: function(x,y,i) { return {x: x-i, y: y-i}; }
      };
  
      
      var checkOrientations = {
        horizontal:     function(x,y,h,w,l) { return w >= x + l; },
        horizontalBack: function(x,y,h,w,l) { return x + 1 >= l; },
        vertical:       function(x,y,h,w,l) { return h >= y + l; },
        verticalUp:     function(x,y,h,w,l) { return y + 1 >= l; },
        diagonal:       function(x,y,h,w,l) { return (w >= x + l) && (h >= y + l); },
        diagonalBack:   function(x,y,h,w,l) { return (x + 1 >= l) && (h >= y + l); },
        diagonalUp:     function(x,y,h,w,l) { return (w >= x + l) && (y + 1 >= l); },
        diagonalUpBack: function(x,y,h,w,l) { return (x + 1 >= l) && (y + 1 >= l); }
      };
  
      
      var skipOrientations = {
        horizontal:     function(x,y,l) { return {x: 0,   y: y+1  }; },
        horizontalBack: function(x,y,l) { return {x: l-1, y: y    }; },
        vertical:       function(x,y,l) { return {x: 0,   y: y+100}; },
        verticalUp:     function(x,y,l) { return {x: 0,   y: l-1  }; },
        diagonal:       function(x,y,l) { return {x: 0,   y: y+1  }; },
        diagonalBack:   function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y    }; },
        diagonalUp:     function(x,y,l) { return {x: 0,   y: y<l-1?l-1:y+1  }; },
        diagonalUpBack: function(x,y,l) { return {x: l-1, y: x>=l-1?y+1:y  }; }
      };
  
      /**
      * Inicializa el puzzle y coloca las palabras.
      *
      * @param {[String]} words: Lista de palabras que estan en el puzzle
      * @param {[Options]} options: Cuando estes rellenando el puzzle
      */
      var fillPuzzle = function (words, options) {
  
        var puzzle = [], i, j, len;
  
        // initialize the puzzle with blanks
        for (i = 0; i < options.height; i++) {
          puzzle.push([]);
          for (j = 0; j < options.width; j++) {
            puzzle[i].push('');
          }
        }
  
        // add each word into the puzzle one at a time
        for (i = 0, len = words.length; i < len; i++) {
          if (!placeWordInPuzzle(puzzle, options, words[i])) {
            // if a word didn't fit in the puzzle, give up
            return null;
          }
        }
  
        // return the puzzle
        return puzzle;
      };
  
      /**   
      *
      * @param {[[String]]} puzzle: Estado actual del puzzle
      * @param {[Options]} options: Las opciones que utilizar cuando rellenas el puzzle
      * @param {String} word: La palabra que posicionar en el puzzle
      */
      var placeWordInPuzzle = function (puzzle, options, word) {
  
        //encontrar las mejores posiciones donde colocar la palabra
        var locations = findBestLocations(puzzle, options, word);
  
        if (locations.length === 0) {
          return false;
        }
  
        // selecionar y colocar la palabra en el lugar random
        var sel = locations[Math.floor(Math.random() * locations.length)];
        placeWord(puzzle, word, sel.x, sel.y, orientations[sel.orientation]);
  
        return true;
      };
  
      /**      
      * @param {[[String]]} puzzle: Estado actual del puzzle
      * @param {[Options]} options: Las opciones que utilizar cuando rellenas el puzzle
      * @param {String} word: La palabra que posicionar en el puzzle
      */
      var findBestLocations = function (puzzle, options, word) {
  
        var locations = [],
            height = options.height,
            width = options.width,
            wordLength = word.length,
            maxOverlap = 0;
  
        // loop through all of the possible orientations at this position
        for (var k = 0, len = options.orientations.length; k < len; k++) {
          
          var orientation = options.orientations[k],
              check = checkOrientations[orientation],
              next = orientations[orientation],
              skipTo = skipOrientations[orientation],
              x = 0, y = 0;
  
          // loop through every position on the board
          while( y < height ) {
  
            // see if this orientation is even possible at this location
            if (check(x, y, height, width, wordLength)) {
  
              // determine if the word fits at the current position
              var overlap = calcOverlap(word, puzzle, x, y, next);
  
              // if the overlap was bigger than previous overlaps that we've seen
              if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
                maxOverlap = overlap;
                locations.push({x: x, y: y, orientation: orientation, overlap: overlap});
              }
  
              x++;
              if (x >= width) {
                x = 0;
                y++;
              }
            }
            else {              
              // Si la celda es invalida, salta a la siguiente mas cercana.
              var nextPossible = skipTo(x,y,wordLength);
              x = nextPossible.x;
              y = nextPossible.y;
            }
  
          }
        }
  
        
        // reducir las posibles localizaciones donde colocar la palabra
        return options.preferOverlap ?
               pruneLocations(locations, maxOverlap) :
               locations;
      };
  
      /**     
      *
      * @param {String} word: La palabra que colocar en el puzzle
      * @param {[[String]]} puzzle: El estado actual del puzzle
      * @param {int} x: La posicion x 
      * @param {int} y: La posicion y
      * @param {function} fnGetSquare
      */
      var calcOverlap = function (word, puzzle, x, y, fnGetSquare) {
        var overlap = 0;
  
        
        for (var i = 0, len = word.length; i < len; i++) {
  
          var next = fnGetSquare(x, y, i),
              square = puzzle[next.y][next.x];
          
          // if the puzzle square already contains the letter we
          // are looking for, then count it as an overlap square
          if (square === word[i]) {
            overlap++;
          }
          // if it contains a different letter, than our word doesn't fit
          // here, return -1
          else if (square !== '' ) {
            return -1;
          }
        }
  
        // if the entire word is overlapping, skip it to ensure words aren't
        // hidden in other words
        return overlap;
      };
  
      /**
      *
      * @param {[Location]} locations: The set of locations to prune
      * @param {int} overlap: The required level of overlap
      */
      var pruneLocations = function (locations, overlap) {
  
        var pruned = [];
        for(var i = 0, len = locations.length; i < len; i++) {
          if (locations[i].overlap >= overlap) {
            pruned.push(locations[i]);
          }
        }
  
        return pruned;
      };
  
      /**
      * Places a word in the puzzle given a starting position and orientation.
      *
      * @param {[[String]]} puzzle: El estado actual del puzzle
      * @param {String} word: La palabra que colocar en el puzzle
      * @param {int} x: La posicion x 
      * @param {int} y: La posicion y
      * @param {function} fnGetSquare
      */
      var placeWord = function (puzzle, word, x, y, fnGetSquare) {
        for (var i = 0, len = word.length; i < len; i++) {
          var next = fnGetSquare(x, y, i);
          puzzle[next.y][next.x] = word[i];
        }
      };
  
      return {
  
        /**
        * Devuelve una lista de todas las posibles orientaciones        
        * @api public
        */
        validOrientations: allOrientations,
  
        /**
        * Devuelve la funcion de orientaciones
        * @api public
        */
        orientations: orientations,
  
        /**
        * Genera el puzle        
        *
        * @param {[String]} words: Lista de palabras a incluir en el puzzle
        * @param {options} settings: Las opciones que utilizar en el puzzle
        * @api public
        */
        newPuzzle: function(words, settings) {
          var wordList, puzzle, attempts = 0, opts = settings || {};
  
          
          wordList = words.slice(0).sort( function (a,b) {
            return (a.length < b.length) ? 1 : 0;
          });
          
          // inicializa las opciones 
          var options = {
            height:       opts.height || wordList[0].length,
            width:        opts.width || wordList[0].length,
            orientations: opts.orientations || allOrientations,
            fillBlanks:   opts.fillBlanks !== undefined ? opts.fillBlanks : true,
            maxAttempts:  opts.maxAttempts || 3,
            preferOverlap: opts.preferOverlap !== undefined ? opts.preferOverlap : true
          };
  
          // añade las palabras al puzzle          
          while (!puzzle) {
            while (!puzzle && attempts++ < options.maxAttempts) {
              puzzle = fillPuzzle(wordList, options);
            }
  
            if (!puzzle) {
              options.height++;
              options.width++;
              attempts = 0;
            }
          }
  
          // rellena los espacios con letras aleatorias.
          if (options.fillBlanks) {
            this.fillBlanks(puzzle, options);
          }
  
          return puzzle;
        },
  
        /**
        * Rellena los espacios con letras aleatorias.
        *
        * @param {[[String]]} puzzle: El estado actual del puzzle
        * @api public
        */
        fillBlanks: function (puzzle) {
          for (var i = 0, height = puzzle.length; i < height; i++) {
            var row = puzzle[i];
            for (var j = 0, width = row.length; j < width; j++) {
  
              if (!puzzle[i][j]) {
                var randomLetter = Math.floor(Math.random() * letters.length);
                puzzle[i][j] = letters[randomLetter];
              }
            }
          }
        },
  
        /**
        *
        * Devuelve
        *   La posicion x donde empieza la palabra
        *   La posicion y donde empieza la palabra
        *   La orientacion de la palabra 
        *   La palabra        *   
        *
        * @param {[[String]]} puzzle: El estado actual del puzzle
        * @param {[String]} words: La lista de las palabras a encontrar
        * @api public
        */
        solve: function (puzzle, words) {
          var options = {
                          height:       puzzle.length,
                          width:        puzzle[0].length,
                          orientations: allOrientations,
                          preferOverlap: true
                        },
              found = [],
              notFound = [];
  
          for(var i = 0, len = words.length; i < len; i++) {
            var word = words[i],
                locations = findBestLocations(puzzle, options, word);
  
            if (locations.length > 0 && locations[0].overlap === word.length) {
              locations[0].word = word;
              found.push(locations[0]);
            }
            else {
              notFound.push(word);
            }
          }
  
          return { found: found, notFound: notFound };
        },
  
        /**
        * Outputs a puzzle to the console, useful for debugging.
        * Returns a formatted string representing the puzzle.
        *
        * @param {[[String]]} puzzle: El estado actual del puzzle
        * @api public
        */
        print: function (puzzle) {
          var puzzleString = '';
          for (var i = 0, height = puzzle.length; i < height; i++) {
            var row = puzzle[i];
            for (var j = 0, width = row.length; j < width; j++) {
              puzzleString += (row[j] === '' ? ' ' : row[j]) + ' ';
            }
            puzzleString += '\n';
          }
  
          console.log(puzzleString);
          return puzzleString;
        }
      };
    };
  
    /**
    * Permitir a la libreria ser usada con el navegador y node.js    
    */
    var root = typeof exports !== "undefined" && exports !== null ? exports : window;
    root.wordfind = WordFind();
  
  }).call(this);