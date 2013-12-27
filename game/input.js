function GameInput()
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
}

GameInput.prototype.onKeyDown = function(e)
{
	if (this.keys[e.keyCode]) {
		this.pressed[this.keys[e.keyCode]] = true;
	}
}

GameInput.prototype.onKeyUp = function(e)
{
	if (this.keys[e.keyCode]) {
		this.pressed[this.keys[e.keyCode]] = false;
	}
}
	
GameInput.prototype.onMouseDown = function(e)
{
	e.preventDefault();
	
	this.pressed['mouse'] = true;
	
	this.calcMouseCoords(e);
}

GameInput.prototype.onMouseUp = function(e)
{
	e.preventDefault();
	
	this.pressed['mouse'] = false;
	
	this.calcMouseCoords(e);
}

GameInput.prototype.onMouseMove = function(e)
{
	e.preventDefault();

	this.calcMouseCoords(e);
}

GameInput.prototype.onWindowClick = function(e)
{
	this.pressed['mouse'] = false;
}

// Touches

GameInput.prototype.onTouchStart = function(e)
{
	e.preventDefault(); 
	
	this.pressed['mouse'] = true;
	
	this.calcMouseCoords(e, true);
}

GameInput.prototype.onTouchMove = function(e)
{
	e.preventDefault(); 

	this.calcMouseCoords(e, true);
}

GameInput.prototype.onTouchEnd = function(e)
{
	e.preventDefault(); 
	
	this.pressed['mouse'] = false;
	
	this.calcMouseCoords(e, true);
}

GameInput.prototype.calcMouseCoords = function(e, isTouch) 
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
	
	var wx = ex - rect.left - left + canvas.worldX;
	var wy = ey - rect.top - top + canvas.worldY;
	
	canvas.mouseMapX = wx >> tileShift;
	canvas.mouseMapY = wy >> tileShift;
}

GameInput.prototype.register = function()
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