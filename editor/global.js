var tileSize  = 32;
var tileShift = (Math.log(tileSize) / Math.log(2));

var canvas, ctx, grid, isMouseDown = false;

var mouseScreenX, 
	mouseScreenY, 
	mouseX, 
	mouseY, 
	prevMouseX, 
	prevMouseY, 
	mouseIsInside = false;

var defaultMap = 'map.json';

var SELECTED_MAP_TYPE    = 'collision';
var SELECTED_OBJECT_TYPE = 'grass1';
var SHOW_COORDS          = 0;
var SHOW_COUNT_OBJECTS   = 0;

function registerInputs()
{
	$(canvas).bind('mousedown', function (e) {
		e.preventDefault();
		calcMouseCoords(e);
		isMouseDown = true;
		handleInput();
	});
	
	$(canvas).bind('mouseup', function (e) {
		e.preventDefault();
		calcMouseCoords(e);
		isMouseDown = false;
	});
	
	$(canvas).bind('mousemove', function (e) {
		e.preventDefault();
		calcMouseCoords(e);
		if (isMouseDown) {
			handleInput(true);
		}
		showInfo();
	});
	
	$(canvas).bind('mouseenter', function (e) {
		mouseIsInside = true;
		showInfo();
	});
	
	$(canvas).bind('mouseleave', function (e) {
		mouseIsInside = false;
		$('#infoObjects').html('Objects in cell: -');
		$('#mouse').html('Mouse: -');
	});
	
	$(document).bind('mouseup', function (e) {  
		isMouseDown = false;
	});
	
	$(document).bind('keydown', function (e) { 
		Keyboard.pressed[e.key] = true;
	});
	
	$(document).bind('keyup', function (e) { 
		Keyboard.pressed[e.key] = false;
	});
}

function calcMouseCoords(e) 
{
	var doc  = document.documentElement, body = document.body;
	var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
	var top  = (doc && doc.scrollTop || body && body.scrollTop || 0);
	var pos  = canvas.getBoundingClientRect();

	var wx = e.pageX - pos.left - left;
	var wy = e.pageY - pos.top - top;
	
	mouseScreenX = wx;
	mouseScreenY = wy;
	
	mouseX = wx >> tileShift;
	mouseY = wy >> tileShift;
	
	if (prevMouseX === undefined) {
		prevMouseX = mouseX;
	}
	
	if (prevMouseY === undefined) {
		prevMouseY = mouseY;
	}
	
	$('#mouse').html('Mouse: ' + mouseX + ',' + mouseY);
}

var Keyboard = {
	pressed: {}
}

var Loader = {
	sources: {},
	isCompleted: false,
	load: function (imgs, onComplete) {
		this.isCompleted = false;
		var len    = imgs.length;
		var loaded = 0;
		imgs.forEach(function (asset) {
			Loader.sources[asset] = new Image();
			Loader.sources[asset].src = '../game/assets/' + asset;
			Loader.sources[asset].onload = function () {
				setTimeout(function () {
					loaded++;
				}/*, Math.floor(Math.random() * 5000)*/);
			};
		});
		var interval = window.setInterval(function () {
			if (typeof Loader.onLoad === 'function') {
				Loader.onLoad(len, loaded);
			}
			if (loaded === len) {
				setTimeout(function () {
					Loader.isCompleted = true;
					if (typeof onComplete === 'function') {
						onComplete();
					}
				}, 100);
				window.clearInterval(interval);
				return;
			}
		}, 100);
	},
	onLoad: function (total, loaded) {
		if (ctx === undefined || canvas === undefined) {
			console.log('no context or canvas');
			return;
		}
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = '20px Verdana';
		ctx.textAlign = 'center';
	    ctx.fillStyle = 'blue';
		ctx.fillText(Math.round((loaded / total) * 100) + '%', x, y);
		ctx.fillText('(' + loaded + ' of ' + total + ')', x, y + 30);
		ctx.restore();
	}
}

function drawTextBG(txt, x, y, b, c, f) {
    /// lets save current state as we make a lot of changes        
    ctx.save();
    /// set font
    ctx.font = f || '10px Verdana';
    /// draw text from top - makes life easier at the moment
    ctx.textBaseline = 'top';
    /// color for background
    ctx.fillStyle = b || '#000';
    /// get width of text
    var width = ctx.measureText(txt).width;
    /// draw background rect assuming height of font
    ctx.fillRect(x, y, width, parseInt(ctx.font, 10));
    /// text color
    ctx.fillStyle = c || '#fff';
    /// draw text on top
    ctx.fillText(txt, x, y);
    /// restore original state
    ctx.restore();
}