const { Game } = require("./Game");

let rooms = [];

const stages = {
	MENU: "menu",
	PLAYING: "playing",
	ENDSCREEN: "endscreen"
}

class Room{
	constructor(options, admin,io){
        this.io = io//be able to contact users
		this.admin = admin;
		this.players = [];
		this.id = makeRoomId();
		this.socketGroup = "room_"+this.id;
		this.stage = stages.MENU;

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
	meetsGameStartConditions() {
		return this.players.length >= 2 && this.stage === stages.MENU;
	}
	startNewGame() {
		this.stage = stages.PLAYING;
		this.game = new Game(this);
		this.game.initialize()
		this.emitGameState();
	}
	triggerGameEnd() {
		this.stage = stages.ENDSCREEN;
		this.emitGameState();
	}
	disconnect(player){
		if(this.game && this.stage === stages.PLAYING) {
			this.game.handlePlayerLeave(player);
		}
        console.log("player: " + player.id + " disconnected from room: " + this.id);
        this.emit('info', player.name + " has disconnected",player);

    }
    connect(player){
		if(this.game && this.stage === stages.PLAYING) {
			this.game.handlePlayerJoin(player);
		}
        console.log("player: " + player.id + " reconnected to room: " + this.id);
        this.emit('info', player.name + " has reconnected",player);
		this.emitGameState();
    }
	leave(player){//leave for good
		if(this.game && this.stage === stages.PLAYING) {
			this.game.handlePlayerLeave(player);
		}

		if(this.players.length === 1){
			//remove the game
			rooms.splice(Room.getIndexOf(this.id), 1);

			return;
		}
		for(let p = 0; p< this.players.length; p++){
			if(this.players[p].id === player.id){

				this.players.splice(p,1);
				if(this.admin.id === player.id){
					this.admin = this.players[0]
					this.emit('info',player.name + " has left the room, new admin is " + this.admin.name);

				}
				else{
					this.emit('info', player.name + " has left the room");

				}

				return;
			}
		}
	}
	join(player){
		this.players.push(player)

	}
	emitGameState() {
		for(let p = 0; p< this.players.length; p++){
			 


		}
	}
	emit(type,message,from){
	    if(this.io !== undefined){
	        for(let p = 0; p< this.players.length; p++){
                this.players[p].syncNoCookie(this.io);
                if(from !== undefined){
                    if(from.id !== this.players[p].id){
                        this.io.to(this.players[p].socketGroup).emit('roomError',{'type':type,'value':message})
                    }
                }
                else{

                    this.io.to(this.players[p].socketGroup).emit('roomError',{'type':type,'value':message})
                }


            }
        }
        else{
            console.log("emit failed, io is undefined, Room.emit")
        }

	}

	getSafe(depth){
	    if(depth === undefined){
            depth = 1;
        }
		let safeRoom = {};
		safeRoom.admin = this.admin.getSafe(depth+1);
		safeRoom.players = [];
		safeRoom.stage = this.stage;
		safeRoom.socketGroup = this.socketGroup;
		safeRoom.name = this.name;
		safeRoom.maxPlayers = this.maxPlayers;
        safeRoom.id = this.id;
		
		if(this.game && (this.stage === stages.PLAYING || this.stage === stages.ENDSCREEN)) {
			safeRoom.game = this.game.serialize();
		}

		for(let p = 0; p< this.players.length; p++){
			safeRoom.players.push(this.players[p].getSafe(depth+1))
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
