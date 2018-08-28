class BattleRound {
  // handles the state of a battle and who won.
  // does not handle socket connections... that's in "match.js"
  constructor(specialParameters, winEvaluator) {
    // this.players=players; // array of player obj.
    // assume2player, and the playerIds are stored in match.js
    this.specialParameters=specialParameters;
    this.winEvaluator=winEvaluator;
    this.battlegrounds=[ // assume2player
      [null,null], // can be integers OR objects. If object, requres winEvaluator
      [null,null],
      [null,null],
    ];
    this.winState={};
  }

  getWinnerIndex() {
    const myReadyState=this.readyState();
    if (myReadyState[0]=='ready' && myReadyState[1]=='ready') {
      if (this.winState.winner) {
        return this.winState.winner
      } else {
        this.checkWinAndGetState();
        return this.winState.winner;
      }
    }
  }

  checkAmounts(amounts) {
    return (amounts.reduce((acc,cur) => acc+cur)==100);
  }

  setBattlegrounds(playerIndex, amounts) {
    if (!this.checkAmounts(amounts)) {
      console.log('Amounts', this.checkAmounts(amounts))
      throw new Error('amounts don\'t add up to 100')
    }
    for (let i=0; i<amounts.length; i++) {
      this.battlegrounds[i][playerIndex]=amounts[i];
    }
  }

  readyState() {
    let readyState=['notReady', 'notReady'] // assume2player
    if (
      this.battlegrounds[0][0]!=null &&
      this.battlegrounds[1][0]!=null &&
      this.battlegrounds[2][0]!=null
    ) {
      readyState[0]='ready';
    }
    if (this.battlegrounds[0][1]!=null && this.battlegrounds[1][1]!=null && this.battlegrounds[2][1]!=null) {
      readyState[1]='ready';
    }
    return readyState;
  }

  checkWinAndGetState() {
    console.log("checkWinAndGetState")
    let returnCheckWinAndGetState={
      readyState:"",
      winner:"none", // null if no winner yet, otherwise 0 or 1 for those players or "tie" if its a tie.
      battlegrounds:this.battlegrounds,
      winArray:[null, null, null], // yyyyy consider using enum rather than 0 and 1.
    }
    if (this.winEvaluator) {
      throw new Error('have not implemented custom winEvaluators')
    } else {
      returnCheckWinAndGetState.readyState=this.readyState();
      if (
          returnCheckWinAndGetState.readyState[0]==='ready' &&
          returnCheckWinAndGetState.readyState[1]==='ready'
        ) {
        returnCheckWinAndGetState.winArray=this.battlegrounds.map((ground)=> {
          if (ground[0]>ground[1]) {
            return 0;
          } else if (ground[1]>ground[0]) {
            return 1;
          } else if (ground[1]==ground[0]) {
            return 2;
          } else {
            throw new Error('checkWin is neither 0, 1, or 2=tie')
          }
        })
        let groundsWon=returnCheckWinAndGetState.winArray.reduce(
          (acc, cur)=>{
            if (cur===0) acc[0]=acc[0]+1;
            if (cur===1) acc[1]=acc[1]+1;
            return acc;
          },
          {0:0, 1:0}
        )
        //console.log(groundsWon)
        if (groundsWon[0]>groundsWon[1]) returnCheckWinAndGetState.winner=0;
        if (groundsWon[1]>groundsWon[0]) returnCheckWinAndGetState.winner=1;
        if (groundsWon[0]===groundsWon[1]) returnCheckWinAndGetState.winner=2;
      }
      this.winState={
        winner: returnCheckWinAndGetState.winner,
        winArray: returnCheckWinAndGetState.winArray,
      }
    }
    //console.log('line86=========')
    //console.log(returnCheckWinAndGetState)
    return returnCheckWinAndGetState;
  }


  // PERSISTENCE FUNCTIONS
  //
  // Start here after completing Step 2!
  // We have written a persist() function for you to save your game state to
  // a store.json file.
  // =====================
  fromObject(object) {
    this.specialParameters=object.specialParameters;
    this.winEvaluator=object.winEvaluator;
    this.battegrounds=object.battegrounds;
  }

  toObject() {
    let object={}
    object.specialParameters=this.specialParameters;
    object.winEvaluator=this.winEvaluator;
    object.battegrounds=this.battegrounds;
    return object;
  }
}

module.exports = BattleRound;
