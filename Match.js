var _ = require('underscore');
var persist = require('./persist');
var BattleSet = require('./BattleSet');
var Player = require('./Player');
var uuidv4 = require('uuid/v4')

class Match {
  constructor({numSets, numRoundsPerSet, specialParameters}) {
    this.matchId=uuidv4();
    this.isStarted=false;
    this.isFinished=false;
    this.players=[null,null];
    this.totalSets=numSets;
    this.matchScores=[0,0]; // no ties allowed
    this.currentSet=new BattleSet({numRoundsPerSet});
    this.oldSets=[];
    this.numRoundsPerSet=numRoundsPerSet;
  }

  startMatch() {
    if (this.isStarted || this.isFinished) { throw "Match already started2 or finished"; }
    if (this.players[0]===null || this.players[1]===null) { throw "need 2 or more players"}
    this.isStarted=true;
    this.currentSet.isStarted=true;
    // console.assert(deck.length===0, "Error: deck not empty");
    // console.assert(_.reduce(this.players, (memo, val, key)=> memo= memo+val.pile.length, 0), "52 cards not dealed correctly" )
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
    console.log('line30, addPlayer');
    console.log(newPlayer);
    if (playerIndex===99) {
      if (this.players[0]===null) {
        console.log('^^^player1')
        this.players[0]= newPlayer;
      } else {
        console.log('^^^player2')
        this.players[1]= newPlayer; // isStarted should handle the case when both players are defined. Don't need to recheck.
      }
    } else {
      this.players[playerIndex]= newPlayer;
    }
    if (this.players[0]!==null && this.players[1]!==null) this.startMatch();
    return newPlayer;
  }

  removePlayer(username) {
    console.log('removePlayer')
    if (this.isStarted ) { throw "removing player erro because game already started"; }
    if (username.trim().length===0) {throw "REMOVE: username is blank-ish";}
    const foundPosition= this.players.map((x)=> (x ? x.username : null)).indexOf(username)
    if (foundPosition!==-1) {
      this.players[foundPosition]=null;
    }
  }

  sum(array) {
    return array.reduce((acc,cur)=>acc+cur);
  }

  currentSetNumber() {
    if (this.isFinished) { return "gameFinished"};
    if (!this.isStarted) { return "notStarted"};
    return this.sum(this.matchScores)+1;
  }

  tryEndSet() {
    if (this.currentSet.setWinnerFinished()) {
      this.matchScores[this.currentSet.winner]++;
      this.oldSets.push(this.currentSet)
      if (this.sum(this.matchScores)>=this.totalSets) {
        this.currentSet={}; // This may be a logic error; may need to have places check that currentSet exists.. or check that the matchIsFinished===false
        this.isFinished=true;
      } else {
        this.currentSet= new BattleSet({numRoundsPerSet: this.numRoundsPerSet});
        this.currentSet.isStarted=true;
      }
    }
  }

  getMatchState() {
    console.log("getMatchState")
    //console.log(this)
    let returnObj = {
      currentBattleRoundNumber: this.currentSet.currentBattleRoundNumber ? this.currentSet.currentBattleRoundNumber() : "Game Done?!",
      scores: this.currentSet.scores,
      totalRounds: this.currentSet.totalRounds,
      oldBattles: this.currentSet.oldBattles,

      totalSets:this.totalSets,
      currentSet:this.currentSet,
      matchIsFinished:this.isFinished,
      matchIsStarted:this.isStarted,
      oldSets:this.oldSets,

      matchScores: this.matchScores,

      playerNames: this.players.map(x=> x ? x.username : null),

    }
    if (this.currentSet.currentBattle && this.currentSet.currentBattle.readyState) returnObj.readyState=this.currentSet.currentBattle.readyState();
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

module.exports = Match;
