var canvas, ctx, debug, info = [];

var tileSize  = 64;
var tileShift = ((Math.log(tileSize)) / (Math.log(2)));

var gameSwitcher;
var gameInput;
var gDebugPaths = 0;

function start()
{
	debug  = document.getElementById('debug');
	canvas = document.getElementById('canvas');
	ctx    = canvas.getContext('2d');
	
	ctx.font = '10px Arial';
	
	canvas.worldX = 0;
	canvas.worldY = 0;
	canvas.mapX = 0;
	canvas.mapY = 0;
	canvas.mouseMapX = 0;
	canvas.mouseMapY = 0;

	gInput = new GameInput();
	gSwitcher = new GameSwitcher();

	(function tick() 
    {
		info = [];
		
		gSwitcher.input();
		
		gSwitcher.logic();
		
		gSwitcher.render();
		
		info.push('Mouse: (' + canvas.mouseMapX + ', ' + canvas.mouseMapY + ')');
		info.push('Paths: (' + gDebugPaths + ')');
		
		debug.innerHTML = info.join('<br />');
		
		if (gSwitcher.done || gInput.done) {
			return;
		}

        requestAnimationFrame(tick);
        
    })();
	
	gInput.register();
}

window.addEventListener('load', start);