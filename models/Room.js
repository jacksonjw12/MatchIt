let rooms = [];

class Room{
	constructor(options, admin,io){
        this.io = io//be able to contact users
		this.admin = admin;
		this.players = [];//admin is populated in the players list from the call from player class
		this.id = makeRoomId();
		this.socketGroup = "room_"+this.id;
		this.stage = "menu";



		if(options.name !== undefined && options.name !== ""){
			this.name = options.name
		}
		else{
			this.name = this.id;
		}
		if(options.maxPlayers !== undefined && Number.isInteger(options.maxPlayers)){
			if(options.maxPlayers <= 4 && options.maxPlayers >= 2){
				this.maxPlayers = options.maxPlayers;
			}
			else{
				this.maxPlayers = 4;
			}
		}
		else{
			this.maxPlayers = 4;
		}

	}
	disconnect(player){
        console.log("player: " + player.id + " disconnected from room: " + this.id);
        this.emit('roomUpdate', {"message":player.name + " has disconnected", "room":this.getSafe()},this.io);


    }
    connect(player){
        console.log("player: " + player.id + " reconnected to room: " + this.id);
        this.emit('roomUpdate', {"message":player.name + " has reconnected", "room":this.getSafe()},this.io);

    }
	leave(player){//leave for good
		if(this.players.length === 1){
			//remove the game
			rooms.splice(Room.getIndexOf(this.id),1);

			return;
		}
		for(let p = 0; p< this.players.length; p++){
			if(this.players[p].id === player.id){

				this.players.splice(p,1);
				if(this.admin.id === player.id){
					this.admin = this.players[0]
					this.emit('roomUpdate', {"message":player.name + " has left, new admin is " + this.admin.name, "room":this.getSafe()},this.io);

				}
				else{
					this.emit('roomUpdate', {"message":player.name + " has left", "room":this.getSafe()},this.io);

				}

				return;
			}
		}
	}
	join(player){
		this.players.push(player)

	}
	emit(type,message){
		for(let p = 0; p< this.players.length; p++){
			this.io.to(this.players[p].socketGroup).emit(type,message)

		}


	}

	getSafe(){
		let safeRoom = {};
		safeRoom.admin = this.admin.getSafe();
		safeRoom.players = [];
		safeRoom.stage = this.stage;
		safeRoom.socketGroup = this.socketGroup;
		safeRoom.name = this.name;
		safeRoom.maxPlayers = this.maxPlayers;
        safeRoom.id = this.id;

		for(let p = 0; p< this.players.length; p++){
			safeRoom.players.push(this.players[p].getSafe())
		}
		return safeRoom

	}
	static get(id){
		if(id === undefined){
			return undefined
		}
		for(let r = 0; r< rooms.length; r++){
			if(rooms[r].id === id){
				return rooms[r];
			}
		}
		return undefined

	}
	static getIndexOf(id){
		if(id === undefined){
			return -1
		}
		for(let r = 0; r< rooms.length; r++){
			if(rooms[r].id === id){
				return r;
			}
		}
		return -1
	}

}
function makeRoomId(){
	let foundGoodId = false;
	while(!foundGoodId){
		let id = makeId();
		let isBad = false;
		for(let i = 0; i< rooms.length; i++){
			if (rooms[i].id === id){
				isBad = true;
				break
			}
		}
		if(!isBad){
			foundGoodId = true;
			return id
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
exports.Room = Room;
exports.rooms = rooms;
