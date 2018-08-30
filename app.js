"use strict";

var path = require('path');
var morgan = require('morgan');
var express = require('express');
var exphbs  = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');

var giphyURLs = require('./public/giphy.json')
const config={
  numSets: 3,
  numRoundsPerSet: 5,
};

app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('tiny'));

app.get('/', function(req, res) {
  res.render('index');
});

// Here is your new Match!
var BattleRound = require('./BattleRound');
var Player = require('./Player');
var Match = require('./Match');
var match = new Match(config);
var BragList = require('./BragList');
var bragList = new BragList({});
bragList.addBrags(giphyURLs);
var count = 0; // Number of active socket connections


function getGameState() {
  return match.getMatchState();
}

io.on('connection', function(socket) {
  console.log('got a new connection');
  if (match.isStarted) {
    console.log("matchStarted")
    socket.emit('StoCGameFull',)
  } else {
    socket.emit('StoCInviteToJoin');
    // io.emit('StoCPwnedURLs', giphyURLs);
  }
  count++;

  socket.on('disconnect', function () {
    console.log("DISCONNECT, RESET")
    count--;
    if (socket.user & !match.isStarted) { match.removePlayer(socket.user.username) };
    if (match.isStarted) { io.emit('StoCReset');}
    // maybe need to clear localstorage on client... not sure about socket.io and reconnect lifecycle
    io.emit('StoCUpdateGame', getGameState());
  });

  socket.on('CtoSReset', ()=> {
    console.log("RESETTING THE SERVER, NEW GAME")
    match = new Match(config);
    io.emit('StoCReset');
    io.emit('StoCInviteToJoin');
    io.emit('StoCUpdateGame', getGameState());
  })

  socket.on('CtoSRequestState', ()=> {
    io.emit('StoCUpdateGame', getGameState());
  })

  socket.on('CtoSUsername', function(username) {
    console.log(username)
    if (typeof(username)==='string' && username.length>=1) {
      // try {
        let addedPlayer=match.addPlayer(99,username, null);
        socket.user= {
          username: addedPlayer.username,
          userId: addedPlayer.id,
        }
        let gameState=getGameState()
        io.emit('StoCUpdateGame', gameState);
        /// ZZZ need to fix the game lifecycle.
      // }
      // catch(e) {
      //   socket.emit('StoCErrorMessage', e );
      // }
    } else {
      socket.emit('StoCErrorMessage', 'Username not a string OR empty'  )
    }
  });

  socket.on('CtoSPwnedURLchosen', url => {
      io.emit('StoCDisplayPwnAwesome', url)
      io.emit('StoCDisplayPwn', url)
  })

  socket.on('CtoSPwnedURL', url => {
    io.emit('StoCDisplayPwn', url)
  })

  socket.on('CtoSSubmitSoldiersFight', function(amounts) {
    console.log('CtoSSubmitSoldiersFight', amounts);
    if (!socket.user) {
      return;
    }
    if (match.currentSet.currentBattle && match.currentSet.currentBattle.setBattlegrounds) {
      match.currentSet.currentBattle.setBattlegrounds(
        match.getPlayerIndex(socket.user.username),
        amounts
      );
      var bothAreReady=getGameState().readyState[0]==="ready" && getGameState().readyState[1]==="ready"  // zzzzz may not work is there is async on the setBattlegrounds
      if (bothAreReady) {
        match.currentSet.tryEndBattleRound();
        // send pwnedURLs just to the winner
        //
        function findClientsSocket(roomId, namespace) {
          var res = []
          // the default namespace is "/"
          , ns = io.of(namespace ||"/");

          if (ns) {
              for (var id in ns.connected) {
                  if(roomId) {
                      var index = ns.connected[id].rooms.indexOf(roomId);
                      if(index !== -1) {
                          res.push(ns.connected[id]);
                      }
                  } else {
                      res.push(ns.connected[id]);
                  }
              }
          }
          return res;
        }

        function getWinnerSocket(gameState) {
          let winnerIndex = gameState.currentSet.oldBattles[gameState.currentSet.oldBattles.length-1].winState.winner;
          console.log('124')
          console.log(winnerIndex)
          if (winnerIndex===1 || winnerIndex===0) {
            return findClientsSocket().filter(x => x.user.username===gameState.playerNames[winnerIndex]);
          } else {
            return [];
          }
        }

        let winnerSocket=getWinnerSocket(getGameState());
        console.log('line133')
        console.log(winnerSocket)
        if (winnerSocket.length>=1) {
          winnerSocket[0].emit('StoCPwnedURLs', bragList.getRandomBrags(3))
        }
        match.tryEndSet();
        io.emit('StoCUpdateGame', getGameState());
      } else {
        io.emit('StoCUpdateGame', getGameState());
      }
    }
  })

  socket.on('CtoSConsoleLogMessage', function(string) {
    console.log('CtoSConsoleLogMessage', string);
  })
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
