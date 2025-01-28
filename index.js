
const PORT = 7777;

let http = require('http');
let static = require('node-static');
let ws = require('ws'); 
//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./public');
 
let http_server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(PORT);


let ws_server = new ws.Server({server: http_server});
let player1, player2;
let ball_pos;
ws_server.on('connection', function (conn) {

	console.log("Usuario conectado");

	if (player1 == null){
		player1 = conn;

		let info = {
			player_num: 1
		}
		player1.send( JSON.stringify(info));

		player1.on('close', function(){
			
			let left = {
				closed: true
			}
			player1 = null;
			player2.send(JSON.stringify(left));

		});
		player1.on('message', function (msg) {
			
			if(player2 == null)
				return;

			let info = JSON.parse(msg);

			if (info.y != null){
				player2.send( JSON.stringify(info));

			}
			else if (info.by != null){
				player2.send( JSON.stringify(info));
			}
			else if (info.s1 != null){
				player2.send(JSON.stringify(info));

				if (info.s1 >= 1){

					let win = {
					game_end: true,
					winner_num: 1

					}
					player1.send(JSON.stringify(win));
					player2.send(JSON.stringify(win));
					return;

				}
				else if (info.s2 >= 1){

				let win = {
					game_end: true,
					winner_num: 2

				}
					player1.send(JSON.stringify(win));
					player2.send(JSON.stringify(win));
					return;

				}
			}
		});
	}
	else if (player2 == null){
		player2 = conn;

		let info = {
			player_num: 2
		}

		player2.send( JSON.stringify(info));
		setTimeout(function(){
			let info = {
				game_start: true
			}
			let info_json = JSON.stringify(info);
			player1.send(info_json);
			player2.send(info_json);
		},500)

		player2.on('close', function(){
			player2 = null;
			let left = {
				closed: true
			}
			player1 = null;
			player1.send(JSON.stringify(left));
		});

		player2.on('message', function (msg) {
			if (player1 == null)
				return;
			
			let info = JSON.parse(msg);

			if (info.y != null){
				player1.send( JSON.stringify(info));
			}
		});
	}

	
});

