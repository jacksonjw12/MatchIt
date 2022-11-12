var emoji = require('node-emoji')

function generateCards(){
    let cards = [];
    let prime=7;
    let numSymbols = prime*prime + prime + 1;
    let numCards = numSymbols;
    //first prime^2 cards
    for(let a = 0; a< prime; a++){
        for(let b = 0; b< prime; b++){
            let card = [prime*prime+a];

            for(let c = 0; c< prime; c++){
                card.push( ((a*c + b) % prime)*prime + c)
            }
            cards.push(card)
        }
    }
    //next prime cards
    for(let a = 0; a< prime; a++){
        let card = [prime*prime+prime];
        for(let b = 0; b<prime; b++){
            card.push(b*prime+a)
        }
        cards.push(card);
    }
    //last card
    let card = []
    for(let a = 0; a <= prime; a++){
        card.push(prime*prime+a);
    }
    cards.push(card);

    //console.log(cards);

    return cards;
}
function createSymbols(cards){
    let symbols = []
    for(let i = 0; i< cards.length; i++){
        let attemptedSymbol = emoji.random();
        while(attemptedSymbol in symbols){
            attemptedSymbol = emoji.random();
        }
        symbols.push(attemptedSymbol)
    }
    return symbols;
}

module.exports = {
    generateCards,
    createSymbols
}