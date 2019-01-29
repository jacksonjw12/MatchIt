let playerFile = require('./models/Player.js');
let Player = playerFile.Player;
let connectedPlayers = playerFile.connectedPlayers;
let roomFile = require('./models/Room.js')
let Room = roomFile.Room
let rooms = roomFile.rooms;

let matchIt = require('./cards.json');
//var locations = {    {"room1":[ {"name":"AAAABB","x":100,"y":100}, {"name":"BABCDC","x":200,"y":100}]}    }

//playerexample = {"Socket":socket, "Location":{"x":42,"y",24}, "Rotation":90, "IGN":"Richard Wang", GameRoom:bestgame}
//gameroom example = {"name":abcd, }



function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

function sendRooms(socket){
	let roomsList = []
	for(let i = 0; i< rooms.length; i++){
		roomsList.push(rooms[i].getSafe())
	}
	socket.emit('listRooms', {"rooms":roomsList})
}
function initializeSockets(io){

	io.on('connection', function (socket) {

		socket.on("login", function(userdata) {
			if(socket.handshake.session.player === undefined || connectedPlayers.getIndexOf(socket.handshake.session.player) < 0){
				console.log("new player")//or was disconnected too long
				let player = new Player(socket);//also saves and joins group
				connectedPlayers.push(player)
			}
			else{
				console.log("returning player")
				let player = connectedPlayers.get(socket.handshake.session.player);
				player.addDevice(socket);//also updates, saves, and joins group
			}
			socket.emit('logged_in', socket.handshake.session);
		});

		socket.on("disconnect", function(userdata) {
			if(socket.handshake.session.player !== undefined ){
				let player = connectedPlayers.get(socket.handshake.session.player);
				if(player !== undefined){
					player.removeDevice();
					console.log("player disconnected");
				}
			}
		});

		socket.on('requestRooms', function (data){
			let rooms = {}
			for(let i = 0; i< rooms.length; i++){
				rooms.push(rooms[i].getSafe())
			}
			socket.emit('listRooms', {"rooms":rooms})
		});

		socket.on('requestInfo',function(data){

			let plr = getPlayer(socket);
			socket.emit('receiveInfo',{"id":plr.id})

		});
		socket.on('updateName',function(data){

			for(let p = 0; p<connectedPlayers.length; p++){
				if(connectedPlayers[p].socket === socket){
					connectedPlayers[p].name = data.name;
					if(connectedPlayers[p].room !== ""){
						let world = getWorld(connectedPlayers[p].room);
						for(let plr = 0; plr<world.players.length; plr++){
							if(plr.id === connectedPlayers[p].id){
								connectedPlayers[p].ign = data.name;
							}
						}
					}
					return;
				}
			}
		});
		socket.on('leaveRoom',function(data){
			console.log(connectedPlayers.length)
			let player = connectedPlayers.get(socket.handshake.session.player);
			player.leaveRoom(io,socket)
			sendRooms(io)


		})


		socket.on('sendMessage', function(data){
			io.to(data.roomName).emit('receivedMessage', data)
		});

		socket.on('startGame',function(data){
			let roomName = player.room
			let world = getWorld(roomName)

			generateGame(world)
			io.to(roomName).emit('roomUpdate', {"message":"game has started", "world":getSafeWorld(world)})

		});
		socket.on('endGame',function(data){
			player = getPlayer(socket)
			roomName = player.room

			world = getWorld(roomName)

			endGame(world)
			io.to(roomName).emit('roomUpdate', {"message":"game has ended", "room":getSafeWorld(world)})

		});

		socket.on('newRoom',function(data){
			let player = connectedPlayers.get(socket.handshake.session.player);

			if(player !== undefined){
				if(player.room !== ""){
					let room = Room.get(player.room)
					if( !isEmptyObject(room) ){
						socket.emit('roomError',{"type":"error", "value":"You are still connected to a different room."})
					}
				}
				let room = new Room(data,player,io);
				rooms.push(room);
				//emit to the player, not the socket, could have multiple devices
				player.joinRoom(room,io,socket)
				sendRooms(io)
			}
			else{
				socket.emit('roomError',{"type":"error", "value":"You are not logged in yet"})

			}

		});

		socket.on('joinRoom', function (data){//This is what is called when aplayer fully joins a room for good
			//user has gone through login process
			let player = connectedPlayers.get(socket.handshake.session.player);
			if(player !== undefined){
				if(typeof player.room !== "string"){
					if(player.room.id !== data.room){
						socket.emit('roomError',{"type":"error", "value":"You are still connected to a different room."})
					}
					else{
						player.sync(socket,io)
					}
				}
				else{
					if(player.room !== ""){
						let room = Room.get(player.room)
						if( !isEmptyObject(room) ){
							socket.emit('roomError',{"type":"error", "value":"You are still connected to a different room."})
						}
					}
					else{
						let room = Room.get(data.room)
						if( room === undefined ){
							socket.emit('roomError', {"type":"error","value":"That room doesn't exist"})
						}
						else{
							if( room.players.length < room.maxPlayers ){
								//emit to the player, not the socket, could have multiple devices
								player.joinRoom(room,io,socket)
								room.emit('roomUpdate', {"message":player.name + " has connected", "room":room.getSafe()},io);
								sendRooms(io)

							}
							else{
								socket.emit('roomError', {"type":"error","value":"That room is full"})
							}
						}
					}
				}
			}
			else{
				socket.emit('roomError',{"type":"error", "value":"You are not logged in yet"})
			}
		});
	});



}
function listRooms(req, res){
	let roomList = [];
	for(let r in rooms){
		let room = rooms[r];
		roomList.push({"name":room.name,"id":room.id,"players":room.players.length,"maxPlayers":room.maxPlayers})
	}
	res.send({"roomList":roomList});
}



exports.listRooms = listRooms;

exports.initializeSockets = initializeSockets;
