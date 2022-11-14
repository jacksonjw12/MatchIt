const { Cards } = require('./Cards');

let games = [];

class Game {
    constructor(room, io) {
        this.room = room;
        this.id = makeGameId();
        this.io = io;
        this.cards = new Cards();
        this.hands = undefined;
        this.stack = undefined;
        this.playerIds = undefined;
        this.players = [];
        this.ongoing = true;
        this.disconnectedPlayers = [];
        this.socketGroup = "game_" + this.id;
        for(let p = 0; p < this.room.players.length; p++) {
			// Join game socket room.
			this.room.players[p].syncGroups();
		}
        

        games.push(this);


        this.emitGameState();

        this.deal();        

    }

    emitGameState() {
        console.log("Emit Game state: ", this.id);
        let gameState = this.serialize();
        const playerList = this.players.length ? this.players : this.room.players;

        for(let p = 0; p < playerList.length; p++) {
            let playerGameState = {
                hand: this.hands ? this.hands[playerList[p].id]: [],
                ...gameState
            };
            this.io.to(playerList[p].socketGroup).emit('gameUpdate',playerGameState);
            this.io.to(playerList[p].socketGroup).emit('roomUpdate', {"test":"abc"});
        }
    }

    deal() {
        console.log("dealing...");

        this.cards.shuffle();
        this.hands = {};
        // Top card is first card in the stack.
        this.stack = [this.cards.get(0)];
        let playerIdMap = [];
        this.players = [];
        this.disconnectedPlayers = [];
        const numPlayers = this.room.players.length
        for(let p = 0; p < numPlayers; p++){
            const playerId = this.room.players[p].id;
            this.hands[playerId] = [];
            playerIdMap.push(playerId);
            this.players.push(this.room.players[p]);
        }
        this.playerIds = playerIdMap;

        // The amount of cards we use from the deck is the nearest multiple of num players.
        let numCards = Math.floor((this.cards.length()-1) / numPlayers) * numPlayers;
        console.log(numCards, numPlayers, this.cards.length(), (this.cards.length-1) / numPlayers);
        for(let c = 1; c < numCards+1; c++){
            let playerId = playerIdMap[(c-1) % numPlayers];
            this.hands[playerId].push(this.cards.get(c));
        }

        this.emitGameState();
    }

    handlePlayerJoin(player) {
        const index = this.disconnectedPlayers.indexOf(player.id);
        if(index > -1) {
            this.disconnectedPlayers.splice(index, 1);
        }
    }
    handlePlayerLeave(player){
       if(!this.playerIds.includes(player.id)){
            return;
       }
       if(this.playerIds.length > 2){
           this.disconnectedPlayers.push(player.id)
       }
       else{
            this.ongoing = false;
            this.room.triggerGameEnd();
       }
    }
    serialize(){
        return {
            ongoing: this.ongoing,
            playerIds: this.playerIds,
            stackTop: this.stack !== undefined ? this.stack[this.stack.length-1] : undefined,
        }
    }
    
    remove() {
		games.splice(Game.getIndexOf(this.id), 1);
	}

    static get(id){
		if(id === undefined){
			return undefined
		}
		for(let r = 0; r< games.length; r++){
			if(games[r].id === id){
				return games[r];
			}
		}
		return undefined

	}
	static getIndexOf(id){
		if(id === undefined){
			return -1
		}
		for(let r = 0; r< games.length; r++){
			if(games[r].id === id){
				return r;
			}
		}
		return -1
	}
}

function makeId() {
    let text = "";
    let possible = "ABCDE0123456789";

    for( let i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function makeGameId(){
	let foundGoodId = false;
	while(!foundGoodId){
		let id = makeId();
		let isBad = false;
		for(let i = 0; i< games.length; i++){
			if (games[i].id === id){
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

module.exports = {
    Game,
    games
}