(function (document, $, wordfind) {

    'use strict';  
    
  
    /**
    * Incializa el objeto
    *
    * @api private
    */
    var WordFindGame = function() {
  
      // Lista de palabras
      var wordList;
  
      /**      
      * Dibuja el puzzle insertando filas de botones
      * @param {String} el: El elemento jquery
      * @param {[[String]]} puzzle: El puzzle que dibujar
      */
      var drawPuzzle = function (el, puzzle) {
        
        var output = '';
        // por cada fila en el puzzle
        for (var i = 0, height = puzzle.length; i < height; i++) {          
          var row = puzzle[i];
          output += '<div>';
          // por cada elemento en esa fila
          for (var j = 0, width = row.length; j < width; j++) {              
              output += '<button class="puzzleSquare" x="' + j + '" y="' + i + '">';
              output += row[j] || '&nbsp;';
              output += '</button>';
          }
          // cierra el div que representa una fila
          output += '</div>';
        }
  
        $(el).html(output);
      };
  
      /**
      * Dibuja las palabras
      *
      * @param {String} el: El elemento jquery
      * @param {[String]} words: Las palabras que dibujar
      */
      var drawWords = function (el, words) {
        
        var output = '<ul>';
        for (var i = 0, len = words.length; i < len; i++) {
          var word = words[i];
          output += '<li class="word ' + word + '">' + word;
        }
        output += '</ul>';
  
        $(el).html(output);
      };
  
  
      /**
      * Eventos del juego
      *
      */
  
      // Estado del juego
      var startSquare, selectedSquares = [], curOrientation, curWord = '';
  
      /**
      * Eventos que suceden manejando el raton
      *
      */
      var startTurn = function () {
        $(this).addClass('selected');
        startSquare = this;
        selectedSquares.push(this);
        curWord = $(this).text();
      };
  
  
  
      /**
      * Eventos que suceden manejando el raton
      *
      */
      var select = function (target) {        
        if (!startSquare) {
          return;
        }
  
        
        var lastSquare = selectedSquares[selectedSquares.length-1];
        if (lastSquare == target) {
          return;
        }
  
        
        var backTo;
        for (var i = 0, len = selectedSquares.length; i < len; i++) {
          if (selectedSquares[i] == target) {
            backTo = i+1;
            break;
          }
        }
  
        while (backTo < selectedSquares.length) {
          $(selectedSquares[selectedSquares.length-1]).removeClass('selected');
          selectedSquares.splice(backTo,1);
          curWord = curWord.substr(0, curWord.length-1);
        }
  
  
        
        var newOrientation = calcOrientation(
            $(startSquare).attr('x')-0,
            $(startSquare).attr('y')-0,
            $(target).attr('x')-0,
            $(target).attr('y')-0
            );
  
        if (newOrientation) {
          selectedSquares = [startSquare];
          curWord = $(startSquare).text();
          if (lastSquare !== startSquare) {
            $(lastSquare).removeClass('selected');
            lastSquare = startSquare;
          }
          curOrientation = newOrientation;
        }
  
        
        var orientation = calcOrientation(
            $(lastSquare).attr('x')-0,
            $(lastSquare).attr('y')-0,
            $(target).attr('x')-0,
            $(target).attr('y')-0
            );
  
        
        if (!orientation) {
          return;
        }
  
        
        if (!curOrientation || curOrientation === orientation) {
          curOrientation = orientation;
          playTurn(target);
        }
  
      };
      
      var touchMove = function(e) {
        var xPos = e.originalEvent.touches[0].pageX;
        var yPos = e.originalEvent.touches[0].pageY;
        var targetElement = document.elementFromPoint(xPos, yPos);
        select(targetElement)
      };
      
      var mouseMove = function() { 
        select(this);
      };
  
      /**      
      * Actualiza el estado del juego cuando la seleccion anterior fue valida
      * @param {el} square: The jQuery element that was played
      */
      var playTurn = function (square) {
  
        
        for (var i = 0, len = wordList.length; i < len; i++) {
          if (wordList[i].indexOf(curWord + $(square).text()) === 0) {
            $(square).addClass('selected');
            selectedSquares.push(square);
            curWord += $(square).text();
            break;
          }
        }
      };
  
      /**
      * Eventos que suceden manejando el raton
      *
      */
      var endTurn = function () {
  
        // Ver si hemos formado una palabra valida
        for (var i = 0, len = wordList.length; i < len; i++) {
          
          if (wordList[i] === curWord) {
            $('.selected').addClass('found');
            wordList.splice(i,1);
            $('.' + curWord).addClass('wordFound');
          }
  
          if (wordList.length === 0) {
            $('.puzzleSquare').addClass('complete');
          }
        }
  
        // reset the turn
        $('.selected').removeClass('selected');
        startSquare = null;
        selectedSquares = [];
        curWord = '';
        curOrientation = null;
      };
  
      /**
      * 
      * @param {int} x1: The x coordinate of the first point
      * @param {int} y1: The y coordinate of the first point
      * @param {int} x2: The x coordinate of the second point
      * @param {int} y2: The y coordinate of the second point
      */
      var calcOrientation = function (x1, y1, x2, y2) {
  
        for (var orientation in wordfind.orientations) {
          var nextFn = wordfind.orientations[orientation];
          var nextPos = nextFn(x1, y1, 1);
  
          if (nextPos.x === x2 && nextPos.y === y2) {
            return orientation;
          }
        }
  
        return null;
      };
  
      return {
  
        /**
        * Crea un juego nuevo
        *
        * Devuelve el juego creado
        *
        * @param {[String]} words: Las palabras que añadir
        * @param {String} puzzleEl
        * @param {String} wordsEl
        * @param {Options} options: Opciones que usar cuando creamos el puzzle
        */
        create: function(words, puzzleEl, wordsEl, options) {
          
          wordList = words.slice(0).sort();
  
          var puzzle = wordfind.newPuzzle(words, options);
  
          
          drawPuzzle(puzzleEl, puzzle);
          drawWords(wordsEl, wordList);
  
          // une eventos a los botones         
          if (window.navigator.msPointerEnabled) {
            $('.puzzleSquare').on('MSPointerDown', startTurn);
            $('.puzzleSquare').on('MSPointerOver', select);
            $('.puzzleSquare').on('MSPointerUp', endTurn);
          }
          else {
            $('.puzzleSquare').mousedown(startTurn);
            $('.puzzleSquare').mouseenter(mouseMove);
            $('.puzzleSquare').mouseup(endTurn);
            $('.puzzleSquare').on("touchstart", startTurn);
            $('.puzzleSquare').on("touchmove", touchMove);
            $('.puzzleSquare').on("touchend", endTurn);
          }
  
          return puzzle;
        },
  
        /**
        * Resolver el puzzle
        *
        * @param {[[String]]} puzzle: El puzzle que resolver
        * @param {[String]} words: Las palabras para resolverlo
        */
        solve: function(puzzle, words) {
  
          var solution = wordfind.solve(puzzle, words).found;
  
          for( var i = 0, len = solution.length; i < len; i++) {
            var word = solution[i].word,
                orientation = solution[i].orientation,
                x = solution[i].x,
                y = solution[i].y,
                next = wordfind.orientations[orientation];
  
            if (!$('.' + word).hasClass('wordFound')) {
              for (var j = 0, size = word.length; j < size; j++) {
                var nextPos = next(x, y, j);
                $('[x="' + nextPos.x + '"][y="' + nextPos.y + '"]').addClass('solved');
              }
  
              $('.' + word).addClass('wordFound');
            }
          }
  
        }
      };
    };
  
  
    
    window.wordfindgame = WordFindGame();
  
  }(document, jQuery, wordfind));