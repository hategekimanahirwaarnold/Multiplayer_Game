const canvas = document.getElementById('game-window');
let c = canvas.getContext("2d");
class Collectible {
  /**
   * The game has at least one type of collectible item. 
   * Complete the Collectible class in Collectible.mjs to implement this. 
   */
  constructor({x, y, value, id}) {
    /**
     * At a minimum, each collectible item object created by the Collectible class should 
     * contain a unique id, a value, and x and y coordinates representing the item's current position.
     */
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.radius = 7;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    c.fillStyle = "lightgreen";
    c.fill();
    c.stroke();
    c.closePath();
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
