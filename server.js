require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const expect = require('chai');
const cors = require('cors');
let { random, float, round } = Math;
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
// security meausures
app.use((req, res, next) => {
  res.setHeader('Server', 'PHP 7.4.3');
  next();
});
// prevent browsers from MIME-sniffing the response
app.use(helmet({
  nocache: true,
  noSniff: true
}))
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());

// establish socet server
const { createServer } = require('node:http');
const { join } = require('node:path');
const socket = require('socket.io');
const server = createServer(app);
const io = new socket(server, { pingInterval: 2000, pingTimeout: 4000 });

// send and receive required documents to frontend
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/img', express.static(process.cwd() + '/img'));
app.use('/assets', express.static(process.cwd() + '/assets'));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

let speed = 5;
let padding = 20;

let ball = {
  position: {
    x: 600 * random() + padding,
    y: 450 * random() + padding,
  },
  id: 1
}

let backendPlayers = {

}
io.on("connection", (socket) => {
  backendPlayers[socket.id] = {
    x: 600 * random() + padding,
    y: 450 * random() + padding,
    sequenceId: 0,
    score: 0,
    rank: 1
  }
  // io.emit("players", backendPlayers)


  socket.on("movement", ({ direction, sequenceId}) => {
    backendPlayers[socket.id].sequenceId = sequenceId
    switch (direction) {
      case "up":
        //handle up case
        if (backendPlayers[socket.id].y > padding)
          backendPlayers[socket.id].y -= speed;
        break;
      case "down":
        //handle down case
        if (backendPlayers[socket.id].y < 480 - padding)
          backendPlayers[socket.id].y += speed;
        break;
      case "left":
        //handle left case
        if (backendPlayers[socket.id].x > padding)
          backendPlayers[socket.id].x -= speed;
        break;
      case "right":
        //handle right case
        if (backendPlayers[socket.id].x < 640 - padding)
          backendPlayers[socket.id].x += speed;
        break;
    }
  })
  socket.on('scored', ( {playerId, ballId }) => {
    if (ballId === ball.id) {
      ball.position = {
        x: 600 * random() + padding,
        y: 450 * random() + padding,
      }
      ball.id++
      // increment the score of the player and send signal to other players
      backendPlayers[socket.id].score++;
      io.emit('ballUpdate', ball);
      io.emit('players', backendPlayers);
    }
  })

  socket.on('disconnect', (reason) => {
    delete backendPlayers[socket.id]
    io.emit('players', backendPlayers)
  })
})

setInterval(() => {
  io.emit('players', backendPlayers);
  io.emit('ballUpdate', ball);
}, 15);

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});
