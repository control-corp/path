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
	
	var nextGameTick = new Date().getTime();
	var fps = 60;
	var measuredFps = 0;
	var milliSecPerFrame = 1000 / fps;
	var frameTime = 0;
	var frame = 0;
	
	(function tick() 
    {
		info = ['FPS: ' + measuredFps];
		
    	var loops = 0;
    	
    	var currentTime = new Date().getTime();
    	
    	if (currentTime - nextGameTick > 60 * milliSecPerFrame) {
            nextGameTick = currentTime - milliSecPerFrame;
        }
    	
    	gameManager.input();
    	
    	while (currentTime > nextGameTick) {
    		gameManager.logic();
            nextGameTick += milliSecPerFrame;
            loops++;   
    	}
    	
        if (loops) {
        	
        	gameManager.render();

        	info.push('Mouse: (' + inputManager.mouseX + ', ' + inputManager.mouseY + ')');
    		info.push('Paths: (' + globalData.paths + ')');
    		
    		if (DEBUG) {
    			if (debug === undefined) {
    				debug = document.getElementById('debug');
    			}
    			for (var i in info) {
    				if (typeof info[i] === 'object') {
    					info[i] = JSON.stringify(info[i]);
    				}
    			}
    			debug.innerHTML = info.join('<br />');
    		}
        }

        if (currentTime > frameTime) {
        	measuredFps = frame;
            frame = 0;
            frameTime = currentTime + 1000;
        } else {
            frame++;
        }
        
        if (gameManager.done || inputManager.done) {
			console.log('Exit...');
			return;
		}
        
        requestAnimationFrame(tick);
        
    })();
	
	return;
	
	/*(function tick() 
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
			for (var i in info) {
				if (typeof info[i] === 'object') {
					info[i] = JSON.stringify(info[i]);
				}
			}
			debug.innerHTML = info.join('<br />');
		}
		
		if (gameManager.done || inputManager.done) {
			console.log('Exit...');
			return;
		}

        requestAnimationFrame(tick);
        
    })();*/
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