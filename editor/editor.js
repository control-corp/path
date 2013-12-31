function handleKeys()
{
	if (grid === undefined) {
		return;
	}
	
	if (!Keyboard.pressed['Left'] && !Keyboard.pressed['Right'] && !Keyboard.pressed['Up'] && !Keyboard.pressed['Down']) {
		return;
	}
	
	var step = 32;
	
	if (Keyboard.pressed['Left']) {
		screenOffsetX -= step;
	}
	
	if (Keyboard.pressed['Right']) {
		screenOffsetX += step;
	}
	
	if (Keyboard.pressed['Up']) {
		screenOffsetY -= step;
	}
	
	if (Keyboard.pressed['Down']) {
		screenOffsetY += step;
	}

	if (Keyboard.pressed['Left'] || Keyboard.pressed['Right'] || Keyboard.pressed['Up'] || Keyboard.pressed['Down']) {
		drawMap();
	}
}

function handleInput(mouseMove)
{
	if (grid === undefined || mouseX < 0 || mouseY < 0 || mouseX >= grid.w || mouseY >= grid.h) {
		return;
	}
	if (isMouseDown && mouseMove) {
		if (mouseX == prevMouseX && mouseY == prevMouseY) {
			return;
		}
	}
	prevMouseX = mouseX;
	prevMouseY = mouseY;
	switch (SELECTED_MAP_TYPE) {
		case 'collision' :
			createCollision(mouseX, mouseY);
			break;
		case 'objects' :
			createObjects(mouseX, mouseY);
			break;
		case 'erase' :
			var idx = mouseX + (mouseY * grid.w);
			if (grid.objects[idx] !== undefined) {
				delete grid.objects[idx];
			}
			break;
		case 'events' :
			createEvents(mouseX, mouseY);
			break;
	}
	drawMap();
}

function createCollision(x, y)
{
	if (grid.collision[y][x] === 1) {
		grid.collision[y][x] = 0;
	} else {
		grid.collision[y][x] = 1;
	}
}

function createObjects(x, y)
{	
	switch (SELECTED_OBJECT_TYPE) {
		default: 
			createObject(x, y);
	}
}

function createEvents(x, y)
{	
	switch (SELECTED_EVENT_TYPE) {
		default: 
			createEvent(x, y);
	}
}

function createEvent(x, y)
{
	if (EVENT_TYPES[SELECTED_EVENT_TYPE] === undefined) {
		alert('"' + SELECTED_EVENT_TYPE + '" does not exists');
		isMouseDown = false;
		return;
	}
	
	var idx = x + (y * grid.w);
	
	if (grid.events[idx] === undefined) {
		grid.events[idx] = {};
	}
	
	var exists = grid.events[idx][SELECTED_EVENT_TYPE] !== undefined;
	var data   = prompt('Input data or empty for delete', (exists && grid.events[idx][SELECTED_EVENT_TYPE].data !== undefined ? grid.events[idx][SELECTED_EVENT_TYPE].data : ''));
	
	if (data !== null) {
		data = $.trim(data);
		if (data === '') {
			if (exists) {
				delete grid.events[idx][SELECTED_EVENT_TYPE];
			}
		} else {
			grid.events[idx][SELECTED_EVENT_TYPE] = {data: data};
		}
	}
	
	deleteEmptyGridEvent(idx);
	
	isMouseDown = false;
}

function deleteEmptyGridEvent(idx)
{
	if (Object.getOwnPropertyNames(grid.events[idx]).length === 0) {
		delete grid.events[idx];
	}
}

function createObject(x, y)
{
	if (OBJECT_TYPES[SELECTED_OBJECT_TYPE] === undefined) {
		alert('"' + SELECTED_OBJECT_TYPE + '" does not exists');
		isMouseDown = false;
		return;
	}
	
	var idx = x + (y * grid.w);
	
	if (grid.objects[idx] === undefined) {
		grid.objects[idx] = {};
	}
	
	if (grid.objects[idx][SELECTED_OBJECT_TYPE] === undefined) {
		grid.objects[idx][SELECTED_OBJECT_TYPE] = {};
	} else {
		delete grid.objects[idx][SELECTED_OBJECT_TYPE];
	}
	
	deleteEmptyGridObject(idx);
}

function deleteEmptyGridObject(idx)
{
	if (Object.getOwnPropertyNames(grid.objects[idx]).length === 0) {
		delete grid.objects[idx];
	}
}

function GameMapObject()
{
	this.render = function ()
	{
		ctx.save();
		switch(this.type) {
			case 'countObjects' :
				drawTextBG(
					this.data, 
					this.worldX, 
					this.worldY,
					null,
					null,
					'15px Verdana'
				);
				break;
			case 'coords' :
				drawTextBG(
					this.x, 
					this.worldX, 
					this.worldY
				);
				drawTextBG(
					this.y, 
					this.worldX, 
					this.worldY + 10
				);
				break;
			case 'collision' :
				ctx.beginPath();
				ctx.strokeStyle = 'red';
				ctx.lineWidth = 3;
				ctx.rect(this.worldX, this.worldY, tileSize, tileSize);
				ctx.closePath();
				ctx.stroke();
				break;
			case 'events' :
				var eventInfo = EVENT_TYPES[this.event];
			    if (eventInfo === undefined) {
			    	throw 'Invalid event';
			    }
			    if (this.data !== undefined) {
					drawTextBG(
					    this.event,
						this.worldX, 
						this.worldY + tileSize - 10,
						'red'
					);
				}
				break;
			default:
				var objInfo = OBJECT_TYPES[this.type];
			    if (objInfo === undefined) {
			    	throw 'Invalid object';
			    }
				if (objInfo.asset && Loader.sources[objInfo.asset] !== undefined) {
					ctx.drawImage(Loader.sources[objInfo.asset], 
						objInfo.x, objInfo.y, objInfo.w, objInfo.h, 
						this.worldX + objInfo.offX, this.worldY + objInfo.offY, objInfo.w, objInfo.h
					);
				} else if (objInfo.color) {
					ctx.fillStyle = objInfo.color;
					ctx.fillRect(this.worldX, this.worldY, tileSize, tileSize);
				} else {
					throw 'Invalid object info (missing asset or color)';
				}
				ctx.beginPath();
				ctx.strokeStyle = 'black';
				ctx.globalAlpha = 0.5;
				ctx.lineWidth = 1;
				ctx.rect(this.worldX, this.worldY, tileSize, tileSize);
				ctx.closePath();
				ctx.stroke();
				break;
		}
		ctx.restore();
	}
}

function GameMapObjectFactory(type, x, y, z, wx, wy, data)
{
	var o = new GameMapObject();
	o.type = type;
	o.x = x;
	o.y = y;
	o.z = z || 0;
	o.worldX = wx;
	o.worldY = wy;
	if (data !== undefined) {
		o.data = data;
	}
	return o;
}

function GameMapEventFactory(type, x, y, z, wx, wy, data)
{
	var o = GameMapObjectFactory(type, x, y, z, wx, wy, data);
	
	o.type = 'events';
	o.event = type;
	
	return o;
}

function drawMap(map)
{
	if (map !== undefined) {
		grid = map;
	}
	
	if (grid === undefined) {
		return;
	}
	
	var type, x, y, w, h, idx, wx, wy, obj, co = 0;
	var objects = [];
	
    for (y = 0, h = grid.h; y < h; y++) {
    	for (x = 0, w = grid.w; x < w; x++) {
    		
    		wx = x * tileSize;
			wy = y * tileSize;

			// collisions
			if (grid.collision[y][x]) {
				objects.push(GameMapObjectFactory('collision', x, y, 9996, wx, wy));
			}
			
			idx = x + (y * w);
			
			obj = this.grid.objects[idx];

			co = 0;
			
			if (obj !== undefined) {
				for (type in obj) {
					if (OBJECT_TYPES[type] !== undefined) {
						objects.push(GameMapObjectFactory(type, x, y, OBJECT_TYPES[type].z, wx, wy, obj[type].data));
						co++;
					}
				} 
			}
			
			obj = this.grid.events[idx];

			if (obj !== undefined) {
				for (type in obj) {
					if (EVENT_TYPES[type] !== undefined) {
						objects.push(GameMapEventFactory(type, x, y, 9997, wx, wy, obj[type].data));
					}
				} 
			}
			
			//show coords
			if (SHOW_COORDS) {
				objects.push(GameMapObjectFactory('coords', x, y, 9998, wx, wy));
			}
			
			//show count objects
			if (SHOW_COUNT_OBJECTS) {
				objects.push(GameMapObjectFactory('countObjects', x, y, 9998, wx, wy, co));
			}
    	}
    }
    
    // mouse follower
	/*if (mouseIsInside) {
		wx = mouseX * tileSize;
		wy = mouseY * tileSize;
		switch (SELECTED_MAP_TYPE) {
			case 'objects' : 
				objects.push(GameMapObjectFactory(SELECTED_OBJECT_TYPE, mouseX, mouseY, 9999, wx, wy));
				break;
			case 'collision' : 
				objects.push(GameMapObjectFactory('collision', mouseX, mouseY, 9999, wx, wy));
				break;
		}
	}*/
	
    objects.sort(sortZIndex);

	ctx.save();
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.font = '10px Verdana';
	
	ctx.translate(-screenOffsetX, -screenOffsetY);

	var wx = grid.w * tileSize;
	var wy = grid.h * tileSize;
	
	ctx.save();
	ctx.strokeStyle = 'black';
	ctx.beginPath();
	ctx.rect(-10, -10, wx + 20, wy + 20);
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
	
	objects.forEach(function (obj) {
		if (obj.render && typeof obj.render === 'function') {
			obj.render();
		}
	});

	ctx.restore();
}

function showInfo()
{
	if (grid === undefined) {
		return;
	}
	
	var obj, event, idx;
	
	idx = mouseX + (mouseY * grid.w);
	
	obj   = this.grid.objects[idx];
	event = this.grid.events[idx];
	
	if (event !== undefined) {
		$('#infoEvents').html('Events in cell: ' + JSON.stringify(event));
	} else {
		$('#infoEvents').html('Events in cell: -');
	}
	
	if (obj !== undefined) {
		$('#infoObjects').html('Objects in cell: ' + JSON.stringify(obj));
	} else {
		$('#infoObjects').html('Objects in cell: -');
	}
}

function loadMap(map)
{
	$.getJSON('../game/maps/' + map + '?r=' + new Date().getTime(), function (data) {
		screenOffsetX = defaultSOX;
		screenOffsetY = defaultSOY;
		drawMap(data);
		$('select[name="map"]').val(map);
		$('.mapPanel').show();
	});
}

$(document).ready(function () {
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	registerInputs();
	
	Loader.onLoad = null;

	Loader.path = '../' + Loader.path;
	
	Loader.load(['grassland.png', 'grass2.png', 'lordshade.png'], function () {
		loadMap($('select[name="map"]').val() || defaultMap);
	});
	
	$(document).on('change', 'select[name="map"]', function () {
		var map = $(this).val();
		if (!map) return;
		loadMap(map);
	});
	
	$(document).on('click', 'input[type="radio"][name="mapType"]', function () {
		SELECTED_MAP_TYPE = $(this).val();
		if (SELECTED_MAP_TYPE === 'objects') {
			$('#objectTypes').show();
		} else {
			$('#objectTypes').hide();
		}
		if (SELECTED_MAP_TYPE === 'events') {
			$('#eventTypes').show();
		} else {
			$('#eventTypes').hide();
		}
	});
	
	$(document).on('click', 'input[type="radio"][name="objectType"]', function () {
		SELECTED_OBJECT_TYPE = $(this).val();
	});
	
	$(document).on('click', 'input[type="radio"][name="eventType"]', function () {
		SELECTED_EVENT_TYPE = $(this).val();
	});
	
	$(document).on('click', 'input[type="checkbox"][name="showCoords"]', function () {
		SHOW_COORDS = $(this).is(':checked') ? 1 : 0;
		drawMap();
	});
	
	$(document).on('click', 'input[type="checkbox"][name="showCountObjects"]', function () {
		SHOW_COUNT_OBJECTS = $(this).is(':checked') ? 1 : 0;
		drawMap();
	});
	
	$(document).on('click', 'button[name="save"]', function () {
		if (grid === undefined) return;
		$.blockUI();
		$.post('savemap.php', {op: 'update', map: $('select[name="map"]').val(), data: JSON.stringify(grid)});
	});
	
	$(document).on('click', 'button[name="createMap"]', function () {
		var mapName = $.trim($('input[name="mapName"]').val());
		if (!mapName) { alert('No name'); return };
		var newMap = {
			w: $('input[name="mapWidth"]').val() || 10,
			h: $('input[name="mapHeight"]').val() || 10,
			collision: [],
			objects: {},
			events: {}
		};
		for (var y = 0; y < newMap.h; ++y) {
			newMap.collision[y] = [];
			for (var x = 0; x < newMap.w; ++x) {
				newMap.collision[y][x] = 0;
			}
		}
		$.blockUI();
		$.post('savemap.php', {op: 'create', map: mapName + '.json', data: JSON.stringify(newMap)}, function () {
			window.location.reload();
		});
	});
			
	$(document).on('click', 'button[name="clear"]', function () {
		if (!confirm('Are you sure to clear all map?') || grid === undefined) return;
		grid.objects = {};
		grid.events = {};
		for (var y = 0; y < grid.h; ++y) {
			for (var x = 0; x < grid.w; ++x) {
				grid.collision[y][x] = 0;
			}
		}
		screenOffsetX = defaultSOX;
		screenOffsetY = defaultSOY;
		drawMap();
	});
	
	$(document).on('click', 'button[name="delete"]', function () {
		if (!confirm('Are you sure to delete the map?')) return;
		$.blockUI();
		$.post('savemap.php', {op: 'delete', map: $('select[name="map"]').val()}, function () {
			window.location.reload();
		});
	});
	
	$(document).ajaxStop(function() {
		$.unblockUI();
	});
	
	var i, o, d, objectTypes = [];
	
	for (i in OBJECT_TYPES) {
		o = OBJECT_TYPES[i];
		d = '';
		if (o.asset) {
			d += '<div style="float: left; width: ' + o.w + 'px; height: ' + o.h + 'px; background-position: -' + o.x + 'px -' + o.y + 'px; background-image: url(../game/assets/' + o.asset + ');">' + i + '</div>';
		} else if (o.color) {
			d += '<div style="float: left; background-color: ' + o.color + '; width: ' + tileSize + 'px; height: ' + tileSize + 'px;">' + i + '</div>';
		}
		objectTypes.push('<div style="float: left; width: 200px;"><input type="radio" style="float: left;" name="objectType" value="' + i + '" />' + d + '</div>');
	}
	
	$('#objectTypes div').html(objectTypes.join(''));
	
	var eventTypes = [];
	
	for (i in EVENT_TYPES) {
		o = EVENT_TYPES[i];
		eventTypes.push('<div style="float: left; width: 96%;"><input type="radio" style="float: left;" name="eventType" value="' + i + '" />' + i + '</div>');
	}
	
	$('#eventTypes div').html(eventTypes.join(''));
	
	$('input[name="mapName"], input[name="mapWidth"], input[name="mapHeight"]').val('');
	$('input[type="radio"][name="mapType"][value="' + SELECTED_MAP_TYPE + '"]').click();
	$('input[type="radio"][name="objectType"][value="' + SELECTED_OBJECT_TYPE + '"]').click();
	$('input[type="radio"][name="eventType"][value="' + SELECTED_EVENT_TYPE + '"]').click();
	$('input[type="checkbox"][name="showCoords"]').attr('checked', (SHOW_COORDS ? true : false));
	$('input[type="checkbox"][name="showCountObjects"]').attr('checked', (SHOW_COUNT_OBJECTS ? true : false));
});