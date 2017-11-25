const config = require('./config');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use('/',express.static(config.publicDir));

const players = require('./players.js');

io.on('connection', socket => {

	players.add(socket.id); 

    console.log(`${socket.id} added`);

	io.emit('server:player-added',players.get(socket.id));

    socket.on('client:give-me-players', ()=>{
        socket.emit('server:all-players', players.get());
    });

    socket.on('client:player-moved',data=>{
        socket.broadcast.emit('server:player-moved', players.get(socket.id));
        players.set(data.id, {name: data.name, posX: data.posX, posY: data.posY, walking: data.walking});
    });

	socket.on('disconnect', ()=>{
		io.emit('server:player-disconnected',socket.id); console.log(`${socket.id} disconnected`);
		players.delete(socket.id);
	});
});

server.listen(config.port, ()=>{
	console.log(`Listening on ${server.address().address}:${config.port}`);
});
