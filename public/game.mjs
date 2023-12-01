const socket = io();
const canvas = document.getElementById('game-window');
let c = canvas.getContext("2d");
import Collectible from './Collectible.mjs';
import Player from './Player.mjs';
/**
 * Establish connection to the server
 * listen to the user's message /use with to evade close
 * Create a new player object with data from new user
 * => Waiting:At a minimum, each player object should contain a unique id,
 *  a score, and x and y coordinates representing the player's current position.
 * => create a new ball if the player is the first one
 * call movePlayer with respect to WASD or arrow keys after decoding message from player
 * 
 */
let frontendPlayers = {

}

// object for keeping track whether the player has won
let scored = {
    collided : false,
    ballId: 0,
    playerId: undefined
};

// let player = new Player({ x: 10, y: 10, score: 0, id: 1, imgSrc: '../img/player.png' })
let ball = new Collectible({ x: 100, y: 100, value: 0, id: 10 })

let playerInputs = []

/////////////////////////////////////////////////////////////
// interacting with backend sockets


// update players
socket.on('players', (backendPlayers) => {
    // console.log("backendPlayers: ", backendPlayers)
    for (let id in backendPlayers) {
        if (!frontendPlayers[id]) {
            frontendPlayers[id] =
                new Player({
                    x: backendPlayers[id].x,
                    y: backendPlayers[id].y,
                    score: 0,
                    id: id,
                    imgSrc: id == socket.id ? '../img/player.png' : '../img/enemy.png',
                    txt: id == socket.id ? '🐵' : '😾'
                })
        } else {
            // update position of players
            gsap.to(frontendPlayers[id], {
                x: backendPlayers[id].x,
                y: backendPlayers[id].y,
                // duration: 0.015,
                // ease: 'power2inOut'
                // ease: 'linear'
            });
            // update scores of players
            frontendPlayers[id].score = backendPlayers[id].score;
            if (id === socket.id) {
                // server reconciliation
                let lastBackendInputEvent = playerInputs.findIndex(input => {

                    return backendPlayers[id].sequenceId === input.sequenceId
                })

                if (lastBackendInputEvent > -1) {
                    // console.log("found it !")
                    // console.log("initial len: ", playerInputs.length)
                    // console.log("new id: ", lastBackendInputEvent)
                    playerInputs.splice(0, lastBackendInputEvent + 1)
                    // console.log("final length: ", playerInputs.length)
                    playerInputs.forEach(input => {
                        frontendPlayers[id].x += input.dx
                        frontendPlayers[id].y += input.dy
                    });
                }
            }
        }
    }

    for (let id in frontendPlayers) {
        if (!backendPlayers[id]) {
            delete frontendPlayers[id]
        }
    }
})

// update ball
socket.on('ballUpdate', (backendBall) => {
    ball.x = backendBall.position.x;
    ball.y = backendBall.position.y;
    ball.id = backendBall.id;
    for (let id in frontendPlayers) {
        frontendPlayers[id].calculateRank(Object.values(frontendPlayers));
    }
})

function movePlayer(direction, sequenceId) {
    setTimeout(() => {
        socket.emit('movement', { direction, sequenceId })
    }, 0);
}

//////////////////////////////////////////////////////////////
// animation loop
let keys = {
    a: {
        pressed: false
    },
    w: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let speed = 5;
let lastKey = '';



function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    ball.draw()

    Object.keys(frontendPlayers).forEach(playerId => {
        // console.log("animate: ", frontendPlayers[playerId])
        if (playerId !== socket.id)
            frontendPlayers[playerId].draw()

    })
    if (frontendPlayers[socket.id]) {
        // detect collision
        if (frontendPlayers[socket.id].collision(ball)) {
            console.log("They collided")
            scored.collided = true
            scored.ballId = ball.id
            scored.playerId = socket.id
        }
        frontendPlayers[socket.id].draw();
    }

}
animate()

let sequenceId = 0
setInterval(() => {
    // handle player movements
    if (keys.a.pressed && lastKey == 'a') {
        sequenceId++
        playerInputs.push({
            sequenceId,
            dx: -speed,
            dy: 0
        })
        frontendPlayers[socket.id].movePlayer('left', speed)
        // frontendPlayers[socket.id].x -= 5
        movePlayer('left', sequenceId)
    } else if (keys.w.pressed && lastKey == 'w') {
        sequenceId++
        playerInputs.push({
            sequenceId,
            dx: 0,
            dy: -speed
        })
        frontendPlayers[socket.id].movePlayer('up', speed)
        // frontendPlayers[socket.id].y -= speed
        movePlayer('up', sequenceId)
    } else if (keys.s.pressed && lastKey == 's') {
        sequenceId++
        playerInputs.push({
            sequenceId,
            dx: 0,
            dy: speed
        })
        frontendPlayers[socket.id].movePlayer('down', speed)
        // frontendPlayers[socket.id].y += speed
        movePlayer('down', sequenceId)
    } else if (keys.d.pressed && lastKey == 'd') {
        sequenceId++
        playerInputs.push({
            sequenceId,
            dx: speed,
            dy: 0
        })
        frontendPlayers[socket.id].movePlayer('right', speed)
        // frontendPlayers[socket.id].x += speed
        movePlayer('right', sequenceId)
    }
    if (scored.collided) {
        scored.collided = false
        socket.emit("scored", {
            playerId: scored.playerId,
            ballId: scored.ballId
        });
    }
}, 15);

document.addEventListener("keydown", ({ key }) => {
    if (!frontendPlayers[socket.id]) return;

    if (key == 'a' || key == 'ArrowLeft') {
        keys.a.pressed = true
        lastKey = 'a'
    } else if (key == 'w' || key == 'ArrowUp') {
        keys.w.pressed = true
        lastKey = 'w'
    } else if (key == 's' || key == 'ArrowDown') {
        keys.s.pressed = true
        lastKey = 's'
    } else if (key == 'd' || key == 'ArrowRight') {
        keys.d.pressed = true
        lastKey = 'd'
    }
});

document.addEventListener("keyup", ({ key }) => {
    if (!frontendPlayers[socket.id]) return;

    if (key == 'a' || key == 'ArrowLeft') {
        keys.a.pressed = false
    } else if (key == 'w' || key == 'ArrowUp') {
        keys.w.pressed = false
    } else if (key == 's' || key == 'ArrowDown') {
        keys.s.pressed = false
    } else if (key == 'd' || key == 'ArrowRight') {
        keys.d.pressed = false
    }
});