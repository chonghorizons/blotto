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
var match = new Match();
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
    socket.emit('StoCInviteToJoin')
  }
  count++;

  socket.on('disconnect', function () {
    console.log("DISCONNECT, RESET")
    count--;
    match = new Match(); // yyyy set up 5 minutes for reconnect
    // yyyyy for existing sockets, (re)attach them to the new Match
    io.emit('StoCReset');
    io.emit('StoCUpdateGame', getGameState());
  });

  socket.on('CtoSReset', ()=> {
    console.log("RESETTING THE SERVER, NEW GAME")
    match = new Match();
    io.emit('StoCReset');
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
    io.emit('StoCDisplayPwn', url)
  })

  socket.on('CtoSSubmitSoldiersFight', function(amounts) {
    console.log('CtoSSubmitSoldiersFight', amounts);
    match.currentBattle.setBattlegrounds(match.getPlayerIndex(socket.user.username), amounts);
    match.tryEndBattleRound();
    io.emit('StoCUpdateGame', getGameState());
    if (true || gameState.roundDidComplete()) {
      io.emit('StoCPwnedURLs', giphyURLs)   // just to winner
    }
  })
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
