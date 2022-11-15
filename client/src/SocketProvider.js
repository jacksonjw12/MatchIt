import { io } from "socket.io-client";

const backend = process.env.NODE_ENV === "development" ? 'ws://localhost:8081' : window.location.href;
// const socket = socketIO.connect('ws://localhost:8081');
const socket = io("http://localhost:8081");

export default class SocketProvider {
    constructor(socket) {
        if(SocketProvider.inst){
            throw "Singleton";
        }
        SocketProvider.inst = this;
        this.socket = socket;

        this.registerListeners();
        
        this.player = undefined;
        this.room = undefined;
        this.game = undefined;

        this.rooms = [];
        

        this.updateCallbacks = [];

    }

    registerUpdateCallback(cb) {
        this.updateCallbacks.push(cb);
        return ()=>{
            const pos = this.updateCallbacks.indexOf(cb);
            if(cb >= 0) {
                this.updateCallbacks.splice(pos, 1);
            }
        }
    }
    
    update() {
        for(let c = 0; c < this.updateCallbacks.length; c++) {
            window.setTimeout(this.updateCallbacks[c],0);
        }
    }
    registerListeners() {

        this.socket.on('logged_in', (data) => this.update(this.loggedIn(data)));
        this.socket.on('listRooms', (data) => this.update(this.listRooms(data)));
        this.socket.on('connect', (data) => this.update(this.onConnect(data)));
        this.socket.on('disconnect', (data) => this.update(this.onDisconnect(data)));
        this.socket.on('roomConnection', (data) => this.update(this.roomConnection(data)));
        this.socket.on('roomUpdate', (data) => this.update(this.roomUpdate(data)));
        this.socket.on('gameUpdate', (data) => this.update(this.gameUpdate(data)));
        this.socket.on('playerUpdate', (data) => this.update(this.playerUpdate(data)));

    }

    loggedIn (data) {
        console.log('logged in: ', data.player)
        this.player = data.player;
    }
    listRooms(data) {
        console.log('listRooms:', data);
        this.rooms = data.rooms;
    }
    onConnect() {
        console.log('connected', this.socket.connected); // true
        this.socket.emit('login', {});
        this.socket.emit('requestRooms', {});
    }
    onDisconnect() {
        console.log('disconnected', socket.connected); // false
    }

    playerUpdate(player) {
        this.player = player;
    }

    roomConnection(room) {
        this.room = room;
    }

    roomUpdate(room) {
        this.room = room;
    }

    gameUpdate(game) {
        this.game = game;
    }
}
new SocketProvider(socket);
