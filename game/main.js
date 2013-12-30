var canvas, ctx, debug, info = [];

var DEBUG     = 1;
var tileSize  = 32;
var tileShift = (Math.log(tileSize) / Math.log(2));

var inputManager;
var gameManager;
var gameCamera;

var globalData = {
	paths: 0
};

function start()
{
	canvas = document.getElementById('canvas');
	ctx    = canvas.getContext('2d');

	gameCamera   = new GameCamera();
	inputManager = new GameInputManager();
	gameManager  = new GameManager();
	
	(function tick() 
    {
		info = [];
		
		gameManager.input()
				   .logic()
				   .render();
		
		info.push('Mouse: (' + inputManager.mouseX + ', ' + inputManager.mouseY + ')');
		info.push('Paths: (' + globalData.paths + ')');
		
		if (DEBUG) {
			if (debug === undefined) {
				debug = document.getElementById('debug');
			}
			debug.innerHTML = info.join('<br />');
		}
		
		if (gameManager.done || inputManager.done) {
			console.log('Exit...');
			return;
		}

        requestAnimationFrame(tick);
        
    })();
}

$(document).ready(function () 
{
	start();
	
	$('button[name="speed+"]').click(function () {
		if (gameManager.currentState.player === undefined) {
			return;
		}
		if (gameManager.currentState.player.isMoving === true) {
			alert('Player is moving');
			return;
		}
		var speed = gameManager.currentState.player.speed;
		speed++;
		if (speed > 10) {
			speed = 10;
		}
		gameManager.currentState.player.speed = speed;
		gameManager.currentState.player.setMapCoords();
	});
	
	$('button[name="speed-"]').click(function () {
		if (gameManager.currentState.player === undefined) {
			return;
		}
		if (gameManager.currentState.player.isMoving === true) {
			alert('Player is moving');
			return;
		}
		var speed = gameManager.currentState.player.speed;
		speed--;
		if (speed < 1) {
			speed = 1;
		}
		gameManager.currentState.player.speed = speed;
		gameManager.currentState.player.setMapCoords();
	});
});