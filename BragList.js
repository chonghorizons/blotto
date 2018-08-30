class BragList {
  //brags are URLS to images that are played after a victory
  //they may be just a string to the URL or an object
  //with "URL" key and other metadata like duration, width, height
  //who submitted the brag

  //one implementation is for the braglist to contain brags from the
  //player, the opponent, a seed master list, and spectator lists


  constructor(config) {
    this.config=config
    this.brags=[];
  }

  getRandomBrags(n) {
    // return an array of n distinct!! brags
    // Not optimized for large n or when n is close to size because re-draws would be needed.
    const size=this.brags.length;
    let nNums=[];
    if (n>size) {
      return new Error("n is larger than the size of the bragList")
    }
    let count=0;
    while (nNums.length<n) {
      let myRandom=Math.floor(Math.random()*size)
      if (nNums.indexOf(myRandom)==-1) {
        nNums.push(myRandom)
      }
    }
    return nNums.map(x=>this.brags[x]);
  }

  getAllBrags() {
    return this.brags;
  }

  removeBrag(url) {
    return;
  }

  addBrags(urlArray) {
    this.brags=this.brags.concat(urlArray);
  }
}


module.exports = BragList;
