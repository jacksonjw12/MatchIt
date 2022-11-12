// var url = require("url");
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var requestHandlers = require("./requestHandlers");
var bodyParser = require('body-parser')

function start() {

	session = require("express-session")({
		secret: "secret!",
		resave: true,
		saveUninitialized: true
	});
	sharedsession = require("express-socket.io-session");
	app.use(session)
	io.use(sharedsession(session));
	//app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));
	//var json = require('express-json');
	app.use(bodyParser.json());

	app.use('/static', express.static('node_modules'));
	app.use(express.static(__dirname + '/public/html'));
	app.use(express.static(__dirname + '/public/js'));
	app.use(express.static(__dirname + '/public/css'));

	app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));


	app.get('/', function (req, res) {
		res.sendFile(__dirname + '/html/index.html')
	});
	app.get('/listRooms',requestHandlers.listRooms)

	var port = 8081;
	if(process.platform === "linux"){
		port = 4001
	}

	server.listen(port);
	
	requestHandlers.initializeSockets(io);
	





	console.log("Server has started");
}

exports.start = start;
