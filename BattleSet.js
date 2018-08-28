var _ = require('underscore');
var persist = require('./persist');
var BattleRound = require('./BattleRound');
var Player = require('./Player');

class BattleSet {
  constructor() {
    this.isStarted=false;
    this.isFinished=false;
    this.totalRounds=7;
    this.scores=[0,0,0]; // third index is ties
    this.currentBattle={};
    this.oldBattles=[];
  }

  getPlayerIndex(username) {
    return this.players.map(x=>x ? x.username : null).indexOf(username);
  }

  addPlayer(playerIndex, username, userId) {
    console.log('addplayerEnter', playerIndex)
    if (this.isStarted || this.isFinished) { throw "game already started1 or finished"; }
    if (username.trim().length===0) {throw "username is blank-ish";}
    if (this.players.map((x)=> (x ? x.username : null)).indexOf(username)!== -1) {throw "username is already in the game (including two different players with same username text)";}
    if (playerIndex!==0 && playerIndex!==1 && playerIndex!==99) {throw "playerIndex needs to be 0 or 1 or 99 (anywhere)";}
    if (this.players[playerIndex]!=null) {throw `already have a player in position ${playerIndex}`}
    var newPlayer = userId ? new Player(username, userId) : new Player(username) ;
    console.log('line30');
    console.log(newPlayer);
    if (playerIndex===99) {
      if (this.players[0]===null) {
        console.log('player1')
        this.players[0]= newPlayer;
      } else {
        console.log('player2')
        this.players[1]= newPlayer; // isStarted should handle the case when both players are defined. Don't need to recheck.
      }
    } else {
      this.players[playerIndex]= newPlayer;
    }
    if (this.players[0]!==null && this.players[1]!==null) this.startMatch();
    return newPlayer;
  }

  startMatch() {
    if (this.isStarted || this.isFinished) { throw "game already started2 or finished"; }
    if (this.players[0]===null || this.players[1]===null) { throw "need 2 or more players"}
    this.isStarted=true;
    this.currentBattle=new BattleRound();
    // console.assert(deck.length===0, "Error: deck not empty");
    // console.assert(_.reduce(this.players, (memo, val, key)=> memo= memo+val.pile.length, 0), "52 cards not dealed correctly" )
  }

  sum(array) {
    return array.reduce((acc,cur)=>acc+cur);
  }

  currentBattleRound() {
    if (this.isFinished) { return "gameFinished"};
    if (!this.isStarted) { return "notStarted"};
    return this.sum(this.scores) +1;
  }

  tryEndBattleRound() {
    const winAndState= this.currentBattle.checkWinAndGetState();
    if (winAndState.winner!=="none") {
      this.scores[winAndState.winner]++;
      this.oldBattles.push(this.currentBattle)
      if (this.sum(this.scores)>=this.totalRounds) {
        this.currentBattle={};
        this.isFinished=true;
      } else {
        this.currentBattle= new BattleRound();
      }
    }
  }

  getMatchState() {
    let returnObj = {
      isFinished:this.isFinished,
      isStarted:this.isStarted,
      totalRounds:this.totalRounds,
      playerNames: this.players.map(x=> x ? x.username : null),
      currentBattleRound:this.currentBattleRound(),
      scores:this.scores,
      oldBattles:this.oldBattles,
    }
    if (this.currentBattle.readyState) returnObj.readyState=this.currentBattle.readyState();
    return returnObj;
  }
}

  // PERSISTENCE FUNCTIONS
  //
  // Start here after completing Step 2!
  // We have written a persist() function for you to save your game state to
  // a store.json file.
  // =====================
  //

//   fromObject(object) {
//     this.isStarted = object.isStarted;
//
//     this.players = _.mapObject(object.players, player => {
//       var p = new Player();
//       p.fromObject(player);
//       return p;
//     });
//
//     this.playerOrder = object.playerOrder;
//
//     this.pile = object.pile.map(card => {
//       var c = new Card();
//       c.fromObject(card);
//       return c;
//     });
//   }
//
//   toObject() {
//     return {
//       isStarted: this.isStarted,
//       players: _.mapObject(this.players, val => val.toObject()),
//       playerOrder: this.playerOrder,
//       pile: this.pile.map(card => card.toObject())
//     };
//   }
//
//   fromJSON(jsonString) {
//     this.fromObject(JSON.parse(jsonString));
//   }
//
//   toJSON() {
//     return JSON.stringify(this.toObject());
//   }
//
//   persist() {
//     if (readGame && persist.hasExisting()) {
//       this.fromJSON(persist.read());
//       readGame = true;
//     } else {
//       persist.write(this.toJSON());
//     }
//   }
// }

module.exports = BattleSet;