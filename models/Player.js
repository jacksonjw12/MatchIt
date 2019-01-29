let connectedPlayers = []
class Player{
	constructor(socket){

		this.connectedDevices = 0;
		this.id = makePlayerId();
		this.name = this.id;
		this.socketGroup = "group_" + this.id;
		this.room = "";
		this.connected = false;


		this.addDevice(socket)

	}
	sync(socket,io){
		this.update(socket);

		socket.emit('roomConnection', {"id":this.id,"room":this.room.getSafe()})
	}
	update(socket){
		socket.join(this.socketGroup);
		socket.handshake.session.player =this.getSafe();// {"id":this.id,"socketGroup":this.socketGroup,"room":this.room};
		socket.handshake.session.save();
	}
	getSafe(){
		let safePlayer = {};
		safePlayer.id = this.id
		safePlayer.name = this.name
		safePlayer.socketGroup = this.socketGroup;
		safePlayer.connectedDevices = this.connectedDevices;
		safePlayer.connected = this.connected;
		if(this.room === ""){
			safePlayer.room = ""
		}
		else{
			safePlayer.room = this.room.id
		}


		return safePlayer;
	}

	addDevice(socket){

		if(this.connectedDevices === 0){
		    clearTimeout(this.timeToRemoval);
            clearTimeout(this.timeToKick);

			if(this.room.id && !this.connected){
			    this.connected = true;
			    this.room.connect(this);
            }

		}
		this.connected = true;
		this.connectedDevices++;
		this.update(socket)

	}
	removeDevice(){
		this.connectedDevices--;

		if(this.connectedDevices === 0){
			this.connected = false;
			this.timeToKick = setTimeout(Player.disconnect,5000,this);
			this.timeToRemoval = setTimeout(Player.remove, 20000, this);
		}
	}
	joinRoom(room,io,socket){
		this.room = room;
		this.update(socket);

		room.join(this);

		io.to(this.socketGroup).emit('roomConnection', {"id":this.id,"room":room.getSafe()})

	}
	leaveRoom(io,socket){
		if(typeof this.room !== "string"){
			this.room.leave(this,io);
			this.room = "";
			this.update(socket);
			io.to(this.socketGroup).emit('roomLeft', {})
		}



	}
	static disconnect(player){
	    player.connected = false;
	    player.room.disconnect(player)

    }

	static remove(player,io){
		console.log("removing player")
        if(player.room.id){
            player.room.leave(player,io)
        }
		connectedPlayers.splice(connectedPlayers.getIndexOf(player))

	}


}
function makePlayerId(){

	let foundGoodId = false;
	while(!foundGoodId){
		let id = makeId();
		let isBad = false;
		for(let i = 0; i< connectedPlayers.length; i++){
			if (connectedPlayers[i].id === id){
				isBad = true;
				break;
			}
		}
		if(!isBad){
			foundGoodId = true;
			return id;
		}
	}
}
function makeId()
{
    let text = "";
    let possible = "ABCDE0123456789";

    for( let i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

connectedPlayers.getIndexOf = function(player){
	if(player === undefined){//no player, not logged in
		return -1;
	}
	for(let i = 0; i< this.length; i++){
		if(this[i] instanceof Player){
			if(this[i].id === player.id){
				return i;
			}
		}
	}
	return -1
}
connectedPlayers.get = function(player){
	if(player === undefined){//no player, not logged in
		return undefined;
	}
	for(let i = 0; i< this.length; i++){

		if(this[i] instanceof Player){
			if(this[i].id === player.id){
				return this[i];
			}
		}

	}
}

exports.Player = Player
exports.connectedPlayers = connectedPlayers;


