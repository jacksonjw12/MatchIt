var fs = require('fs');
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


    createSymbols(cards)
}
function createSymbols(cards){

    let matchIt = {}
    matchIt.cards = cards;
    matchIt.symbols = []
    for(let i = 0; i< cards.length; i++){
        let attemptedSymbol = emoji.random();
        while(attemptedSymbol in matchIt.symbols){
            attemptedSymbol = emoji.random();
        }
        matchIt.symbols.push(attemptedSymbol)
    }
    matchIt = JSON.stringify(matchIt);
    fs.writeFile('cards.json', matchIt, 'utf8', saved);
}
function saved(){
    console.log("Done!")
}

generateCards();
