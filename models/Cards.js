const { generateCards, createSymbols } = require('../generateCards');

const states = {

}

class Cards {
    constructor(cards) {
        this.cards = generateCards();
        this.symbols = createSymbols(this.cards);
    }
    shuffle() {
       
        for (var i = this.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
    get(index){
        return this.cards[index];
    }
    length(){
        return this.cards.length;
    }
    serialize(){

    }
}

exports.Cards = Cards;