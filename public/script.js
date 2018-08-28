// This is the client file. Rename socket.io events as FROMtoTOevent
var socket;
socket = io();
var username;
var giphyURLs;

$(document).ready(function() {


  // Initially, all the buttons except the join game ones are disabled
  function initializeClient() {
    // $('#joinGame').prop('disabled', false);
    $('#submitSoldiers').prop('disabled', false);
    $("#messages-container").empty();
    $("#battle-result-container").empty();
    $("#currentPlayerUsername").empty();

    // Establish a connection with the server
    // Stores the current user
    username = null;

    $('.main-container').show();
    $('.connecting-container').empty();
    $('.connecting-container').hide();
  }
  initializeClient();

  socket.on('StoCreset', ()=> {
    console.log('resetting client')
    localStorage.clear();
    initializeClient();
  });

  socket.on('connect', function() {
    console.log('Connected -- connect is the correct socket.io event');
  });

  socket.on('StoCInviteToJoin', function() {
    localStorage.setItem('id', ''); // reset the id in localStorage
    var usernameInput=prompt("What is your username?");
    console.log(usernameInput)
    if (usernameInput==="") usernameInput="RAND"+String(Math.floor(Math.random()*1000))
    socket.emit('CtoSUsername', usernameInput);
    $("#currentPlayerUsername").text("Joined game as " + usernameInput);
    $('#joinGame').prop('disabled', true);
    $('#observeGame').prop('disabled', true);
    localStorage.setItem('id', usernameInput);
    $("#messages-container").empty().prepend($("<h3>").text("waiting to get 2 players")).fadeTo(5000, 0.4)
    username=usernameInput;
  });

  socket.on('StoCGameFull', function() {
    alert("Game is full (Rooms not yet implmented)");
  });

  // socket.on('start', function() {
  //   $('#startMatch').prop('disabled', true);
  //   $('#playCard').prop('disabled', false);
  //   $('#slap').prop('disabled', false);
  // });

  socket.on('StoCMessage', function(data) {
    $("#messages-container").prepend($("<p>").text(data))
  });

  socket.on("StoCUpdateGame", function(matchState) {
    // If game has started, disable join buttons
    if (matchState.isStarted) {
      // $('#joinGame').prop('disabled', true);
      // $('#observeGame').prop('disabled', true);

      // If game has started and user is undefined, he or she must be an observer
      // if (!user) {
      //   $('#usernameDisplay').text('Observing game...');
      // }
    }

    // Displays the username and number of cards the player has
    // if (user) {
    //   $("#usernameDisplay").text('Playing as ' + user.username);
    //   $(".numCards").text(matchState.numCards[user.id] || 0);
    // }

    // Shows the players who are currently playing
    $(".playerNames").text(matchState.playerNames);

    // Displays the current player
    // if (matchState.isStarted) {
    //   $(".currentPlayerUsername").text(matchState.currentPlayerUsername + "'s turn");
    // } else {
    //   $(".currentPlayerUsername").text('Game has not started yet.');
    // }

    // Displays the number of cards in the game pile
    // $("#pileDisplay").text(matchState.cardsInDeck + ' cards in pile');
    //
    // $(".num").show();

    // If the game is in a winning state, hide everything and show winning message
    // if (matchState.win) {
    //   $('.main-container').hide();
    //   $('.connecting-container').text(matchState.win + ' has won the game!');
    //   $('.connecting-container').append($("<button>").text("Reset/New Game").addClass("reset") );
    //   $('.connecting-container').show();
    // }
    //
    //
    //
    var displayMatchState=Object.assign({},matchState);
    // displayMatchState.oldBattles.reverse(); // mutates
    $("#games-state-container").empty().prepend($("<pre>").text(JSON.stringify(displayMatchState, null, 2)))

    $("#messages-container").empty()
    $("#messages-container").append($('<p>').text(`Round: ${displayMatchState.currentBattleRound}`))
    var yourUserIndex=displayMatchState.playerNames.indexOf(username)
    $("#messages-container").append($('<p>').text(`Score: ${displayMatchState.scores[0]} ${displayMatchState.playerNames[0]} // ${displayMatchState.scores[1]} ${displayMatchState.playerNames[1]} // ${displayMatchState.scores[2]} ties `))
    if (displayMatchState.readyState && displayMatchState.readyState[0]!=displayMatchState.readyState[1]) {
      // console.log(displayMatchState.readyState)
      // console.log(displayMatchState.readyState[yourUserIndex])
      (displayMatchState.readyState[yourUserIndex]==="notReady") ?
        $("#messages-container").append($('<p>').text(`Hurry Up! The other player is waiting for you!`)) :
        $("#messages-container").append($('<p>').text(`...waiting on the other player.`))
    }



    if (matchState.isStarted && matchState.currentBattleRound>1 && matchState.currentBattleRound!=window.state.currentBattleRound) {
      var lastBattle=matchState.oldBattles[matchState.oldBattles.length-1];
      console.log(lastBattle);
      prevWinner= lastBattle.winState.winner
      if (matchState.playerNames.indexOf(username)===lastBattle.winState.winner) {
        var battleResultText='You won!!';
        socket.emit('CtoSPwnedURLchosen' , randomGiphyURL()) // zzzz need to do a modal to allow the user to pick; or default to random after 3 seconds
      } else if (lastBattle.winState.winner===2) {
        var battleResultText='It was a tie!!!!!';
      } else {
        var battleResultText='...you lose';
      }
      $("#battle-result-container").empty().append($("<h2>").text(battleResultText)).fadeTo(5000, 0.2)

      function randomGiphyURL() {
        return giphyURLs[Math.floor(Math.random()*giphyURLs.length)]
      }
    }
    window.state = matchState;
  })

  socket.on("StoCPwnedURLs", function(urlArray) {
    giphyURLs=urlArray;
  })

  socket.on("StoCDisplayPwn", function(url) {
    $('#pwnBox').empty(); // pwnBox shouldn't empty on streak
    myImage=$('<img>').attr("src",url).height("auto").width(200)
    $('#pwnBox').append(myImage);
  })

  socket.on('disconnect', function() {
    // refresh on disconnect
    console.log("client DISCONNECT")
    window.location = window.location;
    $("#currentPlayerUsername").empty();
  });

  // A handler for error messages
  socket.on('StoCErrorMessage', function(data) {
    console.log('StoCErrorMessage');
    console.log(data);
    alert(data);
  })


  // ==========================================
  // Click handlers
  // ==========================================

  // $('#startMatch').on('click', function(e) {
  //   e.preventDefault();
  //   socket.emit('start')
  // });
  //
  // $('#joinGame').on('click', function(e) {
  //   e.preventDefault();
  //   if (!localStorage.getItem('id')) {
  //     var usernameInput=prompt("What is your username?");
  //     console.log("line152");
  //     // $("#usernameDisplay").text(usernameInput);  //  (wait for confirmation from server)
  //     socket.emit('username', usernameInput);
  //   } else {
  //     socket.emit('username', {id: localStorage.getItem('id')})
  //   }
  // });

  // $('#observeGame').on('click', function(e) {
  //   e.preventDefault();
  //   $('#joinGame').prop('disabled', true);
  //   $('#observeGame').prop('disabled', true);
  //   $("#usernameDisplay").text("Observing game...");
  // });
  //
  // $('#playCard').on('click', function(e) {
  //   e.preventDefault();
  //   socket.emit('playCard')
  // });
  //
  // $('#slap').on('click', function(e) {
  //   e.preventDefault();
  //   socket.emit('slap');
  // });

  $('body').on('click', "button#submitSoldiers", function(e) {
    e.preventDefault();
    if (Number($('#battleground1')[0].value) +
        Number($('#battleground2')[0].value) +
        Number($('#battleground3')[0].value) === 100)
    {
      socket.emit(
        'CtoSSubmitSoldiersFight',
        [
          Number($('#battleground1')[0].value),
          Number($('#battleground2')[0].value),
          Number($('#battleground3')[0].value)
        ]
      )
    } else {
      alert("number don't add up to 100, try again")
    }
  });

  $('body').on('click', "button#reset", function(e) {
    e.preventDefault();
    console.log("trying to reset, button pushed")
    socket.emit('CtoSreset');
  })

});
