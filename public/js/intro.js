function intro_newGame(){
	$( "#intro_enterRoomName" ).show(400);

}
function intro_back(){
	$( "#intro_enterRoomName" ).hide(400);
	$('#intro_createRoomName').val("");

}


function changeName_show(){
	$('#changeName_name').attr("placeholder", player.name);
	$('#changeName_visible').show(400)
	$('#changeName_name').focus()
}
function changeName_hide(){
	$('#changeName_visible').hide(400)
	$('#changeName_name').val("")
}


function intro_numPlayersPlus(){
	let maxPlayers = parseInt($('#intro_createRoomMaxPlayers').val());
	if(maxPlayers < 4){
		$('#intro_createRoomMaxPlayers').val(maxPlayers+1)
	}
}
function intro_numPlayersMinus(){
	let maxPlayers = parseInt($('#intro_createRoomMaxPlayers').val());
	if(maxPlayers > 2){
		$('#intro_createRoomMaxPlayers').val(maxPlayers-1)
	}
}
function intro_createRoom(){
	let roomName = $('#intro_createRoomName').val();

	let roomMaxPlayers = parseInt($('#intro_createRoomMaxPlayers').val());

	socket.emit("newRoom",{"name":roomName,"maxPlayers":roomMaxPlayers})
	$( "#intro_enterRoomName" ).hide();

}
function endGame(){
	socket.emit("endGame",{})
}

function connectRoom(room){
	console.log(room)
	if(room === undefined){
		room = document.getElementById("roomName");
	}
	socket.emit('joinRoom',{"room":room})

}


