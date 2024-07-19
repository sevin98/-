const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let players = {};

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
        // create a new player and add it to our players object
        players[socket.id] = {
            rotation: 0,
            x: Math.floor(Math.random() * 700) + 50,
            y: Math.floor(Math.random() * 500) + 50,
            playerId: socket.id,
            team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
        };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('playerDisconnected', socket.id);
    });
    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        if (players[socket.id]) {
        //유효성 검사
        players[socket.id].x = Math.max(0, Math.min(800, movementData.x)); // 범위 제한
        players[socket.id].y = Math.max(0, Math.min(600, movementData.y)); // 범위 제한
        players[socket.id].rotation = movementData.rotation;
        socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });
});
  
server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});