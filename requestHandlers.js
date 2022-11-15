let {Player, connectedPlayers} = require('./models/Player.js');
let {Room, rooms} = require('./models/Room.js')


function isEmptyObject(obj) {
	if(obj === undefined){
		return false;
	}
  	return !Object.keys(obj).length;
}

function sendRooms(socket){
	let roomsList = []
	for(let i = 0; i< rooms.length; i++){
		roomsList.push(rooms[i].serialize(false))
	}
	socket.emit('listRooms', {"rooms":roomsList})
}
function validName(str){
	if(str.length > 0 && str.length < 16){
		return str;
	}
}
function escape(s) {
    return s.replace(/[&"<>]/g, function (c) {
        return {
            '&': "&amp;",
            '"': "&quot;",
            '<': "&lt;",
            '>': "&gt;"
        }[c];
    });
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
					player.removeDevice(socket);
					console.log("player disconnected");
				}
			}
		});
		socket.on('changeName',function(data){
			let player = connectedPlayers.get(socket.handshake.session.player);
			let name = escape(data.name.trim())

			if(player !== undefined){
				if(validName(name)){
					player.changeName(name,socket,io)
				}
				else{
					socket.emit('roomError',{"type":"error", "value":"Invalid Name"})

				}
            }
            else{
            	socket.emit('roomError',{"type":"error", "value":"You are not logged in yet"})
			}
		})

		socket.on('requestRooms', function (data){
			let roomList = [];
			for(let r in rooms){
				let room = rooms[r];
				roomList.push({"name":room.name,"id":room.id,"numPlayers":room.players.length,"maxPlayers":room.maxPlayers})
			}
			console.log("numRooms: ", rooms.length);
			socket.emit('listRooms', {"rooms":roomList})
			
		});

		socket.on('requestInfo',function(data){

			let plr = getPlayer(socket);
			socket.emit('receiveInfo',{"id":plr.id})

		});

		socket.on('leaveRoom',function(data){
			console.log(connectedPlayers.length)
			let player = connectedPlayers.get(socket.handshake.session.player);
			if(player !== undefined){
				player.leaveRoom(io,socket)
				sendRooms(io)
			}
			else{
				console.log("player unable to leave room, is not found",socket.handshake.session.player)
			}



		})


		socket.on('sendMessage', function(data){
			io.to(data.roomName).emit('receivedMessage', data)
		});

		socket.on('startGame',function(data){
			console.log("startGame: ", data);
			let player = connectedPlayers.get(socket.handshake.session.player);
			let room = player.room;
			if(player.room === undefined){
				socket.emit('roomError',{"type":"error", "value":"You are not in a room."})
				return;
			}
			if(!room.meetsGameStartConditions()){
				socket.emit('roomError',{"type":"error", "value":"Game may not be started, conditions are unmet."})
				return;
			}
			room.startNewGame();
			// io.to(roomName).emit('roomUpdate', {"message":"game has started", "world":getSafeWorld(world)})

		});
		socket.on('endGame',function(data){
			// let player = connectedPlayers.get(socket.handshake.session.player);
			// roomName = player.room

			// world = getWorld(roomName)

			// endGame(world)
			// io.to(roomName).emit('roomUpdate', {"message":"game has ended", "room":getSafeWorld(world)})

		});

		socket.on('newRoom',function(data){
			let player = connectedPlayers.get(socket.handshake.session.player);

			if(player !== undefined){
				if(player.room){
					let room = Room.get(player.room.id)
					if( room !== undefined ){
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
				let room = Room.get(data.room)
				if(room !== undefined){
					if(player.room){
						console.log(player.room.id,room.id)
						if(player.room.id === room.id){
							//player is still connected to this room
							player.sync(socket,io)
						}
						else{
							socket.emit('roomError',{"type":"error", "value":"You are still connected to a different room."})
						}
					}
					else{
						if( room.players.length < room.maxPlayers ){
							//emit to the player, not the socket, could have multiple devices
							player.joinRoom(room,io,socket);
							room.emit('info', player.name + " has connected",player);
							sendRooms(io)

						}
						else{
							socket.emit('roomError', {"type":"error","value":"That room is full"})
						}
					}
				}
				else{
					console.log(data)
					socket.emit('roomError', {"type":"error","value":"That room doesn't exist"})

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
