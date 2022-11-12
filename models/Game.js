const { Cards } = require('./Cards');


class Game {
    constructor(room, cb) {
        this.room = room;
        this.cards = new Cards();
        this.hands = undefined;
        this.stack = undefined;
        this.playerIds = undefined;
        this.deal();
        this.ongoing = true;
        this.disconnectedPlayers = [];
        
    }
    deal() {
        this.cards.shuffle();
        this.hands = {};
        // Top card is first card in the stack.
        this.stack = [this.cards.get(0)];
        let playerIdMap = []
        const numPlayers = this.room.players.length
        for(let p = 0; p < numPlayers; p++){
            const playerId = this.room.players[p].id;
            this.hands[playerId] = [];
            this.playerIdMap.push(playerId);
        }
        this.playerIds = playerIdMap;

        // The amount of cards we use from the deck is the nearest multiple of num players.
        let numCards = Math.floor((this.cards.length-1) / numPlayers) * numPlayers;
        for(let c = 1; c < numCards+1; c++){
            let playerId = playerIdMap[(c-1) % numPlayers];
            this.hands[playerId].push(this.cards.get(c));
        }

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
    serialize(playerId){
        return {
            ongoing: this.ongoing,
            playerIds: this.playerIds,
            stackTop: this.stack !== undefined ? this.stack[this.stack.length-1] : undefined,
            hand: playerId !== undefined ? this.hands[playerId] : undefined,
        }
    }
    

}

exports.Game = Game;
