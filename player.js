var crypto = require("crypto");

class Player {
  constructor(username, userId) {
    this.username=username; // yyyy if they are a strong enough player, make their username unique
    this.id= userId ? userId : this.generateId();
    this.customPwns= [];
    return this.id;
  }

  generateId() {
    return crypto.randomBytes(40).toString('hex');
  }

  addPwn(url) {
    this.customPwns.push(url)
  }

  randomPwn() {
    return this.customPwns[Math.floor(Math.random()*this.customPwns.length)]
  }

  setAttr(key, value) {
    this[key]=value;
  }

  getAttr(key) {
    return this[key];
  }


  // PERSISTENCE FUNCTIONS
  //
  // Start here after completing Step 2!
  // We have written a persist() function for you to save your game state to
  // a store.json file.
  // =====================

  // zzzz
  // fromObject(object) {
  //   this.username = object.username;
  //   this.id = object.id;
  //   this.pile = object.pile.map(card => {
  //     var c = new Card();
  //     c.fromObject(card);
  //     return c;
  //   });
  // }
  //
  // toObject() {
  //   return {
  //     username: this.username,
  //     id: this.id,
  //     pile: this.pile.map(card => card.toObject())
  //   };
  // }
}

module.exports = Player;
