var canvas, ctx, debug, info = [];

var tileSize  = 32;
var tileShift = (Math.log(tileSize) / Math.log(2));

var inputManager;
var gameManager;
var camera;
var gDebugPaths = 0;

function start()
{
	debug  = document.getElementById('debug');
	canvas = document.getElementById('canvas');
	ctx    = canvas.getContext('2d');
	
	ctx.font = '10px Arial';
	
	camera = new GameCamera();
	inputManager = new GameInputManager();
	gameManager = new GameManager();
	
	(function tick() 
    {
		info = [];
		
		gameManager.input();
		
		gameManager.logic();
		
		gameManager.render();
		
		info.push('Mouse: (' + inputManager.mouseX + ', ' + inputManager.mouseY + ')');
		info.push('Paths: (' + gDebugPaths + ')');
		
		debug.innerHTML = info.join(' :: ');
		
		if (gameManager.done || inputManager.done) {
			return;
		}

        requestAnimationFrame(tick);
        
    })();
}

$(document).ready(function () 
{
	start();
	
	$('button[name="tileSize+"]').click(function () {
		tileSize <<= 1;
		if (tileSize > 64) {
			tileSize = 64;
		}
		tileShift = (Math.log(tileSize) / Math.log(2));
		gameManager.currentState.player.setMapCoords();
	});
	
	$('button[name="tileSize-"]').click(function () {
		tileSize >>= 1;
		if (tileSize < 16) {
			tileSize = 16;
		}
		tileShift = (Math.log(tileSize) / Math.log(2));
		gameManager.currentState.player.setMapCoords();
	});
	
});