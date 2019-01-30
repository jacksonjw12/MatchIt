let connectedPlayers = []
class Player{
	constructor(socket){

		this.connectedDevices = 0;
		this.id = makePlayerId();
		this.name = this.id;
		this.socketGroup = "group_" + this.id;
		this.room = {};
		this.connected = false;


		this.addDevice(socket)

	}
	sync(socket,io){
	    if(socket !== undefined && io !== undefined){
	        this.update(socket);//set cookie to this

            io.to(this.socketGroup).emit('playerUpdate', this.getSafe())//update
        }
        else{
            console.log("sync failed, Player.sync")
            console.log("socket",socket)
            console.log("io",io)
        }


	}
	syncNoCookie(io){//like sync
	    if(io !== undefined){

            io.to(this.socketGroup).emit('playerUpdate', this.getSafe())//update
        }
        else{
            console.log("syncNoCookie failed, Player.syncNoCookie")
            console.log("io",io)
        }
    }
	changeName(name,socket,io){
	    let oldName = this.name
	    this.name = name;
	    this.sync(socket,io)
        io.to(this.socketGroup).emit('nameChanged',{"name":this.name})
        if(!isEmptyObject(this.room)){
            this.room.emit("info",oldName + " has changed their name to " + this.name,this);

        }


    }
	update(socket){
		socket.join(this.socketGroup);
		socket.handshake.session.player =this.getSafe();// {"id":this.id,"socketGroup":this.socketGroup,"room":this.room};
		socket.handshake.session.save();
	}
	getSafe(depth){
        if(depth === undefined){
            depth = 0;
        }
		let safePlayer = {};
		safePlayer.id = this.id
		safePlayer.name = this.name
		safePlayer.socketGroup = this.socketGroup;
		safePlayer.connectedDevices = this.connectedDevices;
		safePlayer.connected = this.connected;
		if(isEmptyObject(this.room) || depth >= 2){
			safePlayer.room = {}
		}
		else if(depth < 2){
			safePlayer.room = this.room.getSafe(depth+1)
		}

		return safePlayer;
	}

	addDevice(socket){

		if(this.connectedDevices === 0){
		    clearTimeout(this.timeToRemoval);
            clearTimeout(this.timeToKick);
            //console.log(this)
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
		//this.update(socket);

		room.join(this);
        this.sync(socket,io);
		io.to(this.socketGroup).emit('roomConnection', {})

	}
	leaveRoom(io,socket){
		if(!isEmptyObject(this.room)){
			this.room.leave(this,io);
			this.room = {};
			this.sync(socket,io);
			io.to(this.socketGroup).emit('roomLeft', {})
		}



	}
	static disconnect(player){
	    player.connected = false;
	    if(player.room.id){
	        player.room.disconnect(player)
        }

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

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}
exports.Player = Player
exports.connectedPlayers = connectedPlayers;


