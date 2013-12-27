var editor, debug, info = [];

var mapWidth       = 10;
var mapHeight      = 10;
var tileSize       = 32;
var tileShift      = ((Math.log(tileSize)) / (Math.log(2)));
var mapWorldWidth  = (mapWidth * tileSize);
var mapWorldHeight = (mapHeight * tileSize);

var canvas, ctx, grid, selectedCellType = 1, isMouseDown = false;

var mouseX, mouseY, prevMouseX, prevMouseY;

var defaultMap = 'map.json';

function start()
{
	canvas = document.getElementById('canvas');

	ctx = canvas.getContext('2d');
	
	canvas.addEventListener('mousedown', function (e) {
		e.preventDefault();
		calcMouseCoords(e);
		isMouseDown = true;
		handleInput();
	}, false);
	
	canvas.addEventListener('mouseup', function (e) {
		e.preventDefault();
		calcMouseCoords(e);
		isMouseDown = false;
		drawMap();
		//handleInput();
	}, false);
	
	canvas.addEventListener('mousemove', function (e) {
		e.preventDefault();
		calcMouseCoords(e);
		if (isMouseDown) {
			handleInput(true);
		}
	}, false);
}

function handleInput(mouseMove)
{
	var mouseMove = mouseMove || false;
	
	if (isMouseDown && mouseMove) {
		if (mouseX == prevMouseX && mouseY == prevMouseY) {
			return;
		}
	}
	
	prevMouseX = mouseX;
	prevMouseY = mouseY;
	
	var idx = (mouseX + (mouseY * grid.w));
	
	var type = grid.data[idx] === undefined 
			   ? 0 
		       : grid.data[idx];

	type = (type != selectedCellType ? selectedCellType : 0);
	
	if (type == 0) {
		delete grid.data[idx];
	} else {
		grid.data[idx] = type;
	}
	
	drawMap();
}

function drawMap(map)
{
	if (map !== undefined) {
		grid = map;
	}
	
	var type, x, y, w, h, wx, wy, idx;
	
	ctx.clearRect(0, 0, mapWorldWidth, mapWorldHeight);
	
    ctx.save();
    
    ctx.translate(0, 0);
    
    for (y = 0, h = grid.h; y < h; y++) {
    	
    	for (x = 0, w = grid.w; x < w; x++) {
    		
    		wx = x * tileSize;
			wy = y * tileSize;
			
			idx = (x + (y * w));
			
			if (grid.data[idx] !== undefined) {
				switch(grid.data[idx]) {
					case 1:
		    			ctx.fillStyle = 'black';
		    			break;
					case 2:
		    			ctx.fillStyle = 'yellow';
		    			break;
	    		}
			} else {
				ctx.fillStyle = 'white';
			}
			
    		ctx.fillRect(wx, wy, tileSize, tileSize);
    		
    		ctx.fillStyle = 'black';
    		ctx.fillText(idx, wx + 2, wy + 10);
    	}
    }

	ctx.restore();
}

function calcMouseCoords(e) 
{
	var doc = document.documentElement, body = document.body;
	var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
	var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
	var rect = canvas.getBoundingClientRect();
	var wx = e.pageX - rect.left - left;
	var wy = e.pageY - rect.top - top;
	mouseX = wx >> tileShift;
	mouseY = wy >> tileShift;
	if (prevMouseX === undefined) {
		prevMouseX = mouseX;
	}
	if (prevMouseY === undefined) {
		prevMouseY = mouseY;
	}
}

$(document).ready(function () {
	
	start();
	
	$(document).on('change', 'select[name="map"]', function () {
		$.getJSON('../game/maps/' + $(this).val() + '?r=' + new Date().getTime(), function (data) {
			canvas.width  = data.w * tileSize;
			canvas.height = data.h * tileSize;
			drawMap(data);
		});
	});
	
	$('select[name="map"]').val(defaultMap);
	$('select[name="map"]').change();
	$('input[name="mapName"], input[name="mapWidth"], input[name="mapHeight"]').val('');
	$('input[type="radio"][name="cellType"][value="1"]').click();
	
	$(document).on('click', 'input[type="radio"][name="cellType"]', function () {
		selectedCellType = parseInt($(this).val());
	});
	
	$(document).on('click', 'button[name="save"]', function () {
		if (grid === undefined) {
			return;
		}
		$.post('savemap.php', {op: 'update', map: $('select[name="map"]').val(), data: JSON.stringify(grid)});
	});
	
	$(document).on('click', 'button[name="createMap"]', function () {
		var mapName = $.trim($('input[name="mapName"]').val());
		if (!mapName) {
			alert('No name');
			return;
		}
		var newMap = {
			w: $('input[name="mapWidth"]').val() || mapWidth,
			h: $('input[name="mapHeight"]').val() || mapHeight,
			data: {}
		};
		$.post('savemap.php', {op: 'create', map: mapName + '.json', data: JSON.stringify(newMap)}, function () {
			window.location.reload();
		});
	});
			
	$(document).on('click', 'button[name="clear"]', function () {
		if (!confirm('Sure?')) {
			return;
		}
		if (grid === undefined) {
			return;
		}
		grid.data = {};
		drawMap();
	});
	
	$(document).on('click', 'button[name="delete"]', function () {
		if (!confirm('Sure?')) {
			return;
		}
		$.post('savemap.php', {op: 'delete', map: $('select[name="map"]').val()}, function () {
			window.location.reload();
		});
	});
});