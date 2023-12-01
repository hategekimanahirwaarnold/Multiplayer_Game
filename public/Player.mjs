const canvas = document.getElementById('game-window');
let c = canvas.getContext("2d");
class Player {
  constructor({x, y, score, id, imgSrc, txt }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.image = new Image()
    this.image.src = imgSrc
    this.width = 35
    this.height = 25
    this.size = 40
    this.txt = txt
    this.radius = 7
    this.rank = 1;
    this.scorePadding = {
      x: 20,
      y: -3
    }
  }

  movePlayer(dir, speed) {
    let padding = 20
    /**
     * Players can use the WASD and/or arrow keys to move their avatar.
     * Complete the movePlayer method in Player.mjs to implement this.
     */
    /**
     * The movePlayer method should accept two arguments: a string of 
     * "up", "down", "left", or "right", and a number for the amount of 
     * pixels the player's position should change. movePlayer should adjust 
     * the x and y coordinates of the player object it's called from.
     */
    // console.log("y: ", this.y, "x: ", this.x);
    switch (dir) {
      case "up":
        //handle up case
        if (this.y > padding)
          this.y -= speed;
        break;
      case "down":
        //handle down case
        if (this.y < canvas.height - padding)
          this.y += speed;
        break;
      case "left":
        //handle left case
        if (this.x > padding)
          this.x -= speed;
        break;
      case "right":
        //handle right case
        if (this.x < canvas.width - padding)
        this.x += speed;
        break;
    }
  }

  collision(item) {
    /**
     * Players can collide with a collectible item. Complete the collision 
     * method in Player.mjs to implement this.
     */

    /**
     * The collision method should accept a collectible item's object as an argument.
     * If the player's avatar intersects with the item, the collision method should
     * return true.
     */
    let xDist = this.x - item.x;
    let yDist = this.y - item.y;

    let distance = Math.hypot(xDist, yDist)
    if (distance < this.radius + item.radius) {
      // socket.emit("scored", {
      //   playerId: this.id,
      //   ballId: item.id
      // })
      this.score++
      return true
    } else {
      return false
    }
  }

  calculateRank(arr) {
    /**
     * The player's score should be used to calculate their rank among the other players.
     * Complete the calculateRank method in the Player class to implement this.
     */

    /**
     * Waiting:The calculateRank method should accept an array of objects representing all 
     * connected players and return the string Rank: currentRanking/totalPlayers. 
     * For example, in a game with two players, if Player A has a score of 3 and Player B 
     * has a score of 5, calculateRank for Player A should return Rank: 2/2.
     */
    let all = arr.length
    let smaller = 0
    arr.forEach(element => {
      if (element.score <= this.score && this.id !== element.id)
        smaller++
    });

    // console.log(`smaller: ${smaller}, all: ${rank}`)
    this.rank = all - smaller
    return (`Rank: ${this.rank}/${all}`)
  }

  draw() {
    // c.fillStyle = 'black'
    // c.fillText("😼", this.x, this.y  + this.size)
    c.save()
    c.font = '7px'
    // c.fillText(this.score, this.x + this.scorePadding.x + 50, this.y + this.scorePadding.y)
    // c.fillText(this.rank + "--", this.x + this.scorePadding.x, this.y + this.scorePadding.y)
    c.restore()
    c.font = `${this.size}px Press Start`
    c.fillText(this.txt, this.x, this.y  + this.size)
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Player;
} catch(e) {}

export default Player;
