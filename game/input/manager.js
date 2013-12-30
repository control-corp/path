function GameInputManager()
{
	this.done = false;
	
	this.pressed = {};
	
	this.keys = { 
		27 : 'esc',
		37 : 'left',
		38 : 'up',
		39 : 'right',
		40 : 'down'
	};
	
	this.register();
	
	this.mouseX = 0;
	this.mouseY = 0;
	this.mouseRealX = 0;
	this.mouseRealY = 0;
}

GameInputManager.prototype.onKeyDown = function(e)
{
	if (this.keys[e.keyCode]) {
		this.pressed[this.keys[e.keyCode]] = true;
	}
}

GameInputManager.prototype.onKeyUp = function(e)
{
	if (this.keys[e.keyCode]) {
		this.pressed[this.keys[e.keyCode]] = false;
	}
}
	
GameInputManager.prototype.onMouseDown = function(e)
{
	e.preventDefault();
	
	this.pressed['mouse'] = true;
	
	this.calcMouseCoords(e);
}

GameInputManager.prototype.onMouseUp = function(e)
{
	e.preventDefault();
	
	this.pressed['mouse'] = false;
	
	this.calcMouseCoords(e);
}

GameInputManager.prototype.onMouseMove = function(e)
{
	e.preventDefault();

	this.calcMouseCoords(e);
}

GameInputManager.prototype.onWindowClick = function(e)
{
	this.pressed['mouse'] = false;
}

// Touches

GameInputManager.prototype.onTouchStart = function(e)
{
	e.preventDefault(); 
	
	this.pressed['mouse'] = true;
	
	this.calcMouseCoords(e, true);
}

GameInputManager.prototype.onTouchMove = function(e)
{
	e.preventDefault(); 

	this.calcMouseCoords(e, true);
}

GameInputManager.prototype.onTouchEnd = function(e)
{
	e.preventDefault(); 
	
	this.pressed['mouse'] = false;
	
	this.calcMouseCoords(e, true);
}

GameInputManager.prototype.calcMouseCoords = function(e, isTouch) 
{
	var ex, ey;
	
	if (isTouch !== undefined && isTouch) {
		ex = e.targetTouches[0].pageX;
		ey = e.targetTouches[0].pageY;
	} else {
		ex = e.pageX;
		ey = e.pageY;
	}
	
	var doc = document.documentElement, body = document.body;
	var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
	var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
	var rect = canvas.getBoundingClientRect();

	var wx = ex - rect.left - left + (gameCamera ? (gameCamera.x || 0) : 0);
	var wy = ey - rect.top - top + (gameCamera ? (gameCamera.y || 0) : 0);
	
	this.mouseRealX = wx;
	this.mouseRealY = wy;
	
	this.mouseX = wx >> tileShift;
	this.mouseY = wy >> tileShift;
}

GameInputManager.prototype.register = function()
{
	var self = this;
	
	window.addEventListener('keydown', function (e) { self.onKeyDown(e); }, false);
	window.addEventListener('keyup', function (e) { self.onKeyUp(e); }, false);
	canvas.addEventListener('mousemove', function (e) { self.onMouseMove(e); }, false);
    canvas.addEventListener("mousedown", function (e) { self.onMouseDown(e);}, false);
    canvas.addEventListener('mouseup', function (e) { self.onMouseUp(e); }, false);

	window.addEventListener('mouseup', function (e) {  self.onWindowClick(e); }, false);
	window.addEventListener('touchend', function (e) {  self.onWindowClick(e); }, false);
	window.addEventListener('touchcancel', function (e) {  self.onWindowClick(e); }, false);

    canvas.addEventListener('touchstart', function (e) { self.onTouchStart(e); }, false);
    canvas.addEventListener('touchmove', function (e) { self.onTouchMove(e); }, false);
    canvas.addEventListener('touchend', function (e) { self.onTouchEnd(e); }, false);
    canvas.addEventListener('touchcancel', function (e) { self.onTouchEnd(e); }, false);
}