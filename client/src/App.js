import logo from './logo.svg';
import './App.css';
import { io } from "socket.io-client";

const backend = process.env.NODE_ENV === "development" ? 'ws://localhost:8081' : window.location.href;
// const socket = socketIO.connect('ws://localhost:8081');
const socket = io("http://localhost:8081");

socket.on('listRooms',function(data){
  console.log('listRooms', data)
  
});

socket.on("logged_in", function(data) {
 

  console.log("logged_in", data);

});


socket.on('listRooms', (rooms)=> {
  console.log('listRooms', rooms);
})

socket.on("connect", () => {
  console.log('connected', socket.connected); // true
  socket.emit('login', {});
  socket.emit('requestRooms', {});
});

socket.on("disconnect", () => {
  console.log(socket.connected); // false
});
console.log('logging in');

function App() {
  

  return (
    <div className="App">
      <header className="App-header">
        
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {process.env.NODE_ENV}
        </a>
      </header>
    </div>
  );
}

export default App;
