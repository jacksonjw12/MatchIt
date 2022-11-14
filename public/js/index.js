let socket;
let player = {}
let room = {}
let game = {};
let lastState = "lobby"

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

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
function displayRooms(rooms){
	let roomString = ""
	for(let r in rooms){
		let room = rooms[r]
		let numPlayers = room.players
		if(typeof numPlayers === 'object'){
			numPlayers = numPlayers.length;
		}
		roomString += "<tr><td>" + room.name + "</td><td>" + numPlayers + '/' + room.maxPlayers + '</td><td><button class="connectButton" style="border: 1px solid #' + room.id + ';" onclick="connectRoom('+"'"+ room.id +"'"+')">Connect</button></td></tr>'

	}
	roomString += "<tr style='opacity:0;'><td>testMaximumLength</td><td>2/2</td><td><button class='connectButton'>Connect</button></td></tr>"


	let table = "<h2 class='currentRooms'>Current Rooms</h2>" +
		"<div class='roomTableContainer'>" +
		"<div class='roomTableHeaderContainer'><div class='roomTableHeader'>Name</div><div class='roomTableHeader'># Players</div><div class='roomTableHeader'></div></div>" +
		"<div class='roomTableScrollable'>" +
		"<table class='roomTable' style='text-align:center;'>" +
		 roomString +

		"</table>" +
		"</div>" +
		"</div>";


	document.getElementById('intro_rooms').innerHTML = table
}
function getRooms(){
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
			rooms = JSON.parse(xmlHttp.responseText).roomList;
			/*rooms = [{"name":"testing 123","players":1,"maxPlayers":2,"id":makeId()}]
			for(let i = 0; i < 10; i++){
				rooms.push(JSON.parse(JSON.stringify(rooms[0])))
				rooms[i+1].id = makeId()
			}
			*/
			displayRooms(rooms)

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
function render(){
	if(player.room.id === undefined){
		hideRoomSidebars()
		document.getElementById("intro").style.display = 'block';
		document.getElementById("menu").style.display = 'none';
		document.getElementById("game").style.display = 'none';

	}
	else if(player.room.stage === "menu"){
		showRoomSidebars()
		document.getElementById("intro").style.display = 'none';
		document.getElementById("menu").style.display = 'block';
		document.getElementById("game").style.display = 'none';

		document.getElementById("menuPlayers").innerHTML = '';

		document.getElementById("roomTitle").innerHTML = "Room: "+player.room.name
		for(let p = 0; p < player.room.players.length; p++){
			document.getElementById("menuPlayers").innerHTML+=getMenuPlayerItem(player.room.players[p],p+1,player.room.admin.id)
		}

	}
	else if(data.room.stage === "playing"){
		showRoomSidebars()
		document.getElementById("intro").style.display = 'none';
		document.getElementById("menu").style.display = 'none';
		document.getElementById("game").style.display = 'block';
		document.getElementById("ingamePlayers").innerHTML = '';


		for(let p = 0; p < player.room.players.length; p++){
			//console.log(document.getElementById("menuPlayers").innerHTML);
			document.getElementById("ingamePlayers").innerHTML+=getIGPlayerItem(player.room.players[p],player.room.first)
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
function showRoomSidebars(){
	if(player.room.id !== undefined){
		$('.sidebarRoom').css('background-color', "#" + player.room.id);
		$('.sidebarRoom').css('background-color', "#" + player.room.id);
	}
	$('.sidebarRoom').animate({width:'show'},350);
	$('.sidebarRoom').animate({width:'show'},350);
}
function hideRoomSidebars(){

	$('.sidebarRoom').animate({width:'hide'},350);
	$('.sidebarRoom').animate({width:'hide'},350);
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
function validName(str){
	if(str.length > 0 && str.length < 16){
		return str;
	}
}

function changeName_changeName(){
	let name = $('#changeName_name').val().trim();
	if(validName(name)){
		socket.emit('changeName',{'name':name})
	}
	else{
		info({"type":"error","value":"invalid name, must be between 1-15 characters"})
	}

}
function setup(){
	$('#userSettings').show();

}


function main(){
	socket = io();

	socket.emit('login')


	socket.on('listRooms',function(data){
		console.log(data)
		displayRooms(data.rooms)
		
	});

	socket.on("logged_in", function(data) {
		console.info("logged_in event received. Check the console");
		console.info("sessiondata after logged_in event is ", data);

		player = data.player;

		initializeSidebars()
		setup()


		render()

		$('#userSettings_name').text(player.name);

		console.log(player.room)
		// if(!isEmptyObject(player.room)){
		// 	socket.emit('joinRoom',{"room":player.room})
		// }
    })

	socket.on("nameChanged",function(data){
		info({"type":"success","value":"Name changed to " + data.name})

		$('#userSettings_name').text(data.name);
		changeName_hide();
	})


	socket.on('roomConnection', function(data){//contains room and our new id
		console.log('roomConnection', data);

		info({"type":"info","value":"Joined Room"})
	});

	socket.on('playerUpdate',function (data){
		player = data;
		console.log("player update", player);
		render();
	})

	socket.on('roomError',function(data){
		console.log(data)
		info(data)
	})
	socket.on('roomUpdate', function (data) {//contains room
		console.log("room was updated", data);
	});

	socket.on('gameUpdate', function (data) {
		console.log("Game was updated", data);
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

