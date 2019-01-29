let socket;
let player = {}

let room = ""


function toggleLocationInfo(){
	if(document.getElementById("locationToggleText").innerHTML == "hide"){
		document.getElementById("sensitiveInfo").style.display = "none"
		document.getElementById("locationToggleText").innerHTML ="show"
	}
	else{
		document.getElementById("sensitiveInfo").style.display = "block"
		document.getElementById("locationToggleText").innerHTML = "hide"
	}
}
function strike(e){

	if(e.classList.contains("player-name-striked") ){

		e.classList.remove('player-name-striked');
		e.classList.add('player-name');


	}
	else{
		e.classList.remove('player-name');
		e.classList.add('player-name-striked');


	}
}
function strikeRef(e){

	if(e.classList.contains("locationReference-striked") ){

		e.classList.remove('locationReference-striked');


	}
	else{

		e.classList.add('locationReference-striked');


	}
}

function getRooms(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
			rooms = JSON.parse(xmlHttp.responseText).roomList;
			console.log(rooms)
			let string = "<h2 >Current Rooms</h2><table class='roomTable' style='text-align:center;'><tr><th>Name</th><th># Players</th><th></th></tr>"
			for(let r in rooms){
				let room = rooms[r]
				string += "<tr><td>" + room.name + "</td><td>" + room.players + '/' + room.maxPlayers + '</td><td><button class="connectButton" onclick="connectRoom('+"'"+ room.id +"'"+')">Connect</button</td</tr>'

			}

			document.getElementById('intro_rooms').innerHTML = string
		}

		}
	xmlHttp.open("GET", "listRooms", true); // true for asynchronous
	xmlHttp.send({});

}

function getMenuPlayerItem(plr,i,adminId){
	let color = "#" + plr.id;
	let admin = (plr.id === adminId)?'<div class="menu_icon">⭐</div>':'<div style="opacity:0;" class="menu_icon">⭐</div>';
	let info = (plr.id === player.id)?'<div class="menu_icon">😀</div>':'<div style="opacity:0;" class="menu_icon">😀</div>';
	let bgOpacity = 1;
	if(!plr.connected){
		bgOpacity = .5;
		info = '<div class="menu_icon">❌</div>';
	}
	//return '<li class="player-name" style="color:' + color + ';">'+'<u>' +plr.name +'</u></li>'
	return '<div style="color:'+color+';opacity:'+bgOpacity+';" class="menu_playerItemContainer"><div class="menu_playerItemNumber">'+i+'.</div>'+admin+info+ '<div class="menu_playerName">'+plr.name+'</div></div>'
}

function getIGPlayerItem(plr,first){
	//console.log(plr)
	if(plr.id == first){
		return '<li class="player-name" onclick="strike(this)">'+plr.name+'<a class="firstPlayer">1st</a></li>'

	}
	else{
		return '<li class="player-name" onclick="strike(this)">'+plr.name+'</li>'

	}
}
function getMyRoles(world){

	for(var p = 0; p< world.playerData.length; p++){
		if(world.playerData[p].id == player.id){
			if(world.playerData[p].isSpy){
				player.isSpy = true;
				player.location = "Spy"
				player.role = ""
				return;
			}
			else{
				player.isSpy = false;
				player.location = world.location
				player.role = world.playerData[p].role
				return;
			}
		}
	}
}
// function assumeId(world){
// 	var foundName = false

// 	for(var plr = 0; plr< world.players.length; plr++){
// 		if(world.players[plr].name == player.name){
// 			foundName = true
// 			socket.emit("assumeId",{"id":world.player[plr].id})
// 		}
// 	}
// 	// for(var p = 0; p< world.playerData.length; p++){
// 	// 	if(world.playerData[p].id == player.id){
// 	// 		if(world.playerData[p].isSpy){
// 	// 			player.isSpy = true;
// 	// 			player.location = "Spy"
// 	// 			player.role = ""
// 	// 			return;
// 	// 		}
// 	// 		else{
// 	// 			player.isSpy = false;
// 	// 			player.location = world.location
// 	// 			player.role = world.playerData[p].role
// 	// 			return;
// 	// 		}
// 	// 	}
// 	// }
// }
function setUpRoom(data){
	console.log(data)
	if(data.room.stage === "menu"){
		document.getElementById("intro").style.display = 'none';
		document.getElementById("menu").style.display = 'block';
		document.getElementById("game").style.display = 'none';

		document.getElementById("menuPlayers").innerHTML = '';

		document.getElementById("roomTitle").innerHTML = "Room: "+data.room.name
		for(let p = 0; p < data.room.players.length; p++){
			console.log(data.room)
			document.getElementById("menuPlayers").innerHTML+=getMenuPlayerItem(data.room.players[p],p+1,data.room.admin.id)
		}

	}
	if(data.room.stage == "game"){
		document.getElementById("intro").style.display = 'none';
		document.getElementById("menu").style.display = 'none';
		document.getElementById("game").style.display = 'block';
		document.getElementById("ingamePlayers").innerHTML = '';
		getMyRoles(data.room);
		document.getElementById("location").innerHTML = player.location
		document.getElementById("role").innerHTML = player.role
		if(player.location === undefined){
			// getMyRolesByName(data.world)
			player.location = "spectator"
			player.role = ""
		}

		for(var p = 0; p < data.room.players.length; p++){
			//console.log(document.getElementById("menuPlayers").innerHTML);
			document.getElementById("ingamePlayers").innerHTML+=getIGPlayerItem(data.room.players[p],data.room.first)
		}

	}
}
function startGame(){
	socket.emit("startGame",{})
}

function joinGame(){
	var success = giveName(document.getElementById("playerName").value)
	if(!success){
		alert("Please enter a valid name")
		return;
	}

	document.getElementById("firstConnectionStep").style.display = "none";
	document.getElementById("secondConnectionStep").style.display = "block";


}
function giveName(playerName){
	if ( !(/\S/.test(playerName))){
		console.log("Bad name, all whitespace or length 0")
   		return false;
	}
	player.name = playerName
	socket.emit("updateName",{"name":playerName})
	return true;
}
function initializeSidebars(){
	$('.sidebarLeft').css('background-color', "#" + player.id);
	$('.sidebarRight').css('background-color', "#" + player.id);
	$('.sidebarLeft').animate({width:'toggle'},350);
	$('.sidebarRight').animate({width:'toggle'},350);
	//$('.sidebarLeft').slideDown();
	//$('.sidebarRight').slideDown();

}


function connect(){
	roomName = document.getElementById("roomName").value;
	playerName = document.getElementById("playerName").value;

	if(roomName != ""){

		room = roomName
		//document.getElementById("canvasHolder").innerHTML =
		// '<canvas id="myCanvas" width="' + gameDimmensions[0] + 'px" height="' + gameDimmensions[1] +'px" style="border:1px solid #ababab;float:left;"></canvas>' +
		// '<div id="chatContainer" style="padding-bottom:7px;display: inline-block;height:' + chatDimmensions[1] + 'px;width:'+chatDimmensions[0]+'px;border:1px solid #ababab;">' +
		// '<div style="overflow-y:scroll;height:'+(chatDimmensions[1]-30)+'px;" id="chat"></div><br><form action="javascript:sendMessage()"><input type="text" style="width:80%;" id="chatTextBox"><input style="width:20%;" type="submit" id="chatBoxSubmit"></form></div>';
		//createPlayer(playerName)

		player.name = playerName
		player.room = roomName


		socket = io();

	}



}
console.log(123)



function makeId(){
    var text = "";
    var possible = "ABCDE0123456789";//no f becayse i dont want any tots white

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function sendMessage(){
	let message = document.getElementById("chatTextBox").value;
	if(message !== "" && typeof message === "string"){
		console.log("dude")
		socket.emit('sendMessage', {"message":message,"roomName":room,"ign":player.ign,"id":player.id})
		document.getElementById("chatTextBox").value = "";
	}

}

function receivedMessage(data){
	document.getElementById("chat").innerHTML+= '<u style="color:#' + data.id + '">' + data.ign + '</u>' + ' : ' + data.message + '</br>';
	var objDiv = document.getElementById("chat");
	objDiv.scrollTop = objDiv.scrollHeight;
}
// document.onload = function(){
// 	console.log(123)
// //main()
// //getRooms();

// }
function leaveRoom(){
	socket.emit('leaveRoom',{})

}

function main(){
	socket = io();

	socket.emit('login')
	socket.on('receiveInfo',function(data){
		console.log(data)
		player.id = data.id
		initializeSidebars()


	})

	socket.on('listRooms',function(data){
		console.log(data)
		let string = "<h2 >Current Rooms</h2><table class='roomTable' style='text-align:center;'><tr><th>Name</th><th># Players</th><th></th></tr>"
			for(let r in data.rooms){
				let room = data.rooms[r];
				string += "<tr><td>" + room.name + "</td><td>" + room.players.length + '/' + room.maxPlayers + '</td><td><button class="connectButton" onclick="connectRoom('+"'"+ room.id +"'"+')">Connect</button</td</tr>'

			}

			document.getElementById('intro_rooms').innerHTML = string
	});

	socket.on("logged_in", function(data) {
		console.info("logged_in event received. Check the console");
		console.info("sessiondata after logged_in event is ", data);
		player = data.player;

		initializeSidebars()
		console.log(player.room)
		if(player.room !== ""){
			socket.emit('joinRoom',{"room":player.room})
		}
    })


	socket.on('roomConnection', function(data){//contains room and our new id
		setUpRoom(data)
		console.log("here we go")
	});
	socket.on('roomError',function(data){
		console.log("ERROR")
		console.log(data)
		info(data)
	})
	socket.on('roomUpdate', function (data) {//contains room
		console.log("room was updated")
		setUpRoom(data)

	});
	socket.on('roomLeft',function(data){
		document.getElementById("intro").style.display = 'block';

		document.getElementById("menu").style.display = 'none';
		document.getElementById("game").style.display = 'none';


	})



}
$(document).ready(function(){
	main()
	getRooms();
})

