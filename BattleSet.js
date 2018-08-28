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
    this.winner=null;
    this.tieBreaker=null;
  }

  startSet() {
    if (this.isStarted || this.isFinished) { throw "game already started2 or finished"; }
    this.isStarted=true;
    this.currentBattle=new BattleRound();
    // console.assert(deck.length===0, "Error: deck not empty");
    // console.assert(_.reduce(this.players, (memo, val, key)=> memo= memo+val.pile.length, 0), "52 cards not dealed correctly" )
  }

  sum(array) {
    return array.reduce((acc,cur)=>acc+cur);
  }

  setWinnerFinished() {
    if (this.sum(this.scores)>=this.totalRounds) {
      this.isFinished=true;
      if (this.scores[0]>this.scores[1]) { this.winner=0; }
      if (this.scores[0]<this.scores[1]) { this.winner=0; }
      this.tieBreaker=false;

      if (this.scores[0]===this.scores[1]) {
        this.tieBreaker = true;
        this.winner = Math.floor(Math.random()*2);
      }
      return true;
    } else {
      return false;
  }

  currentBattleRound() {
    if (this.isFinished) { return "gameFinished"};
    if (!this.isStarted) { return "notStarted"};
    return this.sum(this.scores) +1;
  }

  tryEndBattleRound() { // mixes battle stuff and set stuff. Need to re-read.
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
