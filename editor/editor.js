function handleInput(mouseMove)
{
	if (mouseX < 0 || mouseY < 0 || mouseX >= grid.w || mouseY >= grid.h) {
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
			var idx = mouseX + (mouseY * grid.w);
			if (grid.objects[idx] !== undefined && grid.objects[idx].type !== SELECTED_OBJECT_TYPE) {
				if (confirm('This object is different than selected one. Do you want to override it?')) {
					createObjects(mouseX, mouseY);
				}
				isMouseDown = false;
				break;
			} else {
				createObjects(mouseX, mouseY);
			}
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
		case 'portal':
			createPortal(x, y);
			break;
		default: 
			createObject(x, y);
	}
}

function createPortal(x, y)
{
	var idx    = x + (y * grid.w);
	var exists = grid.objects[idx] !== undefined;
	var data   = prompt('Input data or empty for delete', (exists ? grid.objects[idx].data : ''));
	
	if (data !== null) {
		data = $.trim(data);
		if (data === '') {
			if (exists) {
				delete grid.objects[idx];
			}
		} else {
			grid.objects[idx] = createEmpyObject('portal', data);
		}
	}
	
	isMouseDown = false;
}

function createObject(x, y)
{
	var idx = x + (y * grid.w);
	
	if (grid.objects[idx] === undefined) {
		grid.objects[idx] = createEmpyObject(SELECTED_OBJECT_TYPE);
	} else {
		if (grid.objects[idx].type !== SELECTED_OBJECT_TYPE) {
			grid.objects[idx] = createEmpyObject(SELECTED_OBJECT_TYPE);
		} else {
			delete grid.objects[idx];
		}
	}
}

function createEmpyObject(type, data)
{
	var o = {};
	
	o.type = type;
	
	if (data) {
		o.data = data;
	}
	
	return o;
}

function GameMapObject()
{
	this.render = function ()
	{
		ctx.save();
		switch(this.type) {
			case 'coords' :
				ctx.fillStyle = 'red';
				ctx.fillText(this.x + ',' + this.y, this.worldX + 3, this.worldY + 8);
				//ctx.fillText('y:' + this.y, this.worldX + 3, this.worldY + 16);
				break;
			case 'collision' :
				ctx.beginPath();
				ctx.strokeStyle = 'red';
				ctx.lineWidth = 3;
				ctx.rect(this.worldX, this.worldY, tileSize, tileSize);
				ctx.stroke();
			break;
			default:
				var objInfo = OBJECT_TYPES[this.type];
			    if (objInfo === undefined) {
			    	throw 'Invalid object';
			    }
				if (objInfo.asset) {
					ctx.drawImage(Loader.sources[objInfo.asset], 
						objInfo.x, objInfo.y, objInfo.w, objInfo.h, 
						this.worldX + objInfo.offX, this.worldY + objInfo.offY, objInfo.w, objInfo.h
					);
				} else if (objInfo.color) {
					ctx.fillStyle = objInfo.color;
					ctx.fillRect(this.worldX, this.worldY, tileSize, tileSize);
				} else {
					throw 'Invalid object info';
				}
				if (this.data) {
					ctx.fillStyle = 'white';
					ctx.fillText(this.data, this.worldX + 3, this.worldY + tileSize - 5);
				}
				ctx.beginPath();
				ctx.strokeStyle = 'green';
				ctx.lineWidth = 1;
				ctx.rect(this.worldX, this.worldY, tileSize, tileSize);
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
	o.z = z;
	o.worldX = wx;
	o.worldY = wy;
	o.data = data;
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
	
	var type, x, y, w, h, idx, wx, wy, obj, objInfo;
	var gameObject, objects = [];
	
    for (y = 0, h = grid.h; y < h; y++) {
    	for (x = 0, w = grid.w; x < w; x++) {
    		
    		wx = x * tileSize;
			wy = y * tileSize;

			// collisions
			if (grid.collision[y][x]) {
				objects.push(GameMapObjectFactory('collision', x, y, 9997, wx, wy));
			}
			
			idx = x + (y * w);
			
			obj = this.grid.objects[idx];
			
			if (obj !== undefined) {
				objects.push(GameMapObjectFactory(obj.type, x, y, OBJECT_TYPES[obj.type].z, wx, wy, obj.data));
			}

			//show coords
			if (SHOW_COORDS) {
				objects.push(GameMapObjectFactory('coords', x, y, 9998, wx, wy));
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
	ctx.font = '8px Verdana';
	ctx.translate(0, 0);
	objects.forEach(function (obj) {
		if (obj.render && typeof obj.render === 'function') {
			obj.render();
		}
	});
    
	ctx.restore();
}

$(document).ready(function () {
	
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	registerInputs();
	
	Loader.load(['grassland.png'], function () {
		$('select[name="map"]').val(defaultMap).change();
	});
	
	$(document).on('change', 'select[name="map"]', function () {
		var map = $(this).val();
		if (!map) return;
		$.getJSON('../game/maps/' + map + '?r=' + new Date().getTime(), function (data) {
			canvas.width  = (data.w * tileSize);
			canvas.height = (data.h * tileSize);
			drawMap(data);
			$('#viewport').show();
		});
	});
	
	$(document).on('click', 'input[type="radio"][name="mapType"]', function () {
		SELECTED_MAP_TYPE = $(this).val();
		if (SELECTED_MAP_TYPE === 'objects') {
			$('#objectTypes').show();
		} else {
			$('#objectTypes').hide();
		}
	});
	
	$(document).on('click', 'input[type="radio"][name="objectType"]', function () {
		SELECTED_OBJECT_TYPE = $(this).val();
	});
	
	$(document).on('click', 'input[type="checkbox"][name="showCoords"]', function () {
		SHOW_COORDS = $(this).is(':checked') ? 1 : 0;
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
			objects: {}
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
		if (!confirm('Sure?') || grid === undefined) return;
		grid.objects = {};
		for (var y = 0; y < grid.h; ++y) {
			for (var x = 0; x < grid.w; ++x) {
				grid.collision[y][x] = 0;
			}
		}
		drawMap();
	});
	
	$(document).on('click', 'button[name="delete"]', function () {
		if (!confirm('Sure?')) return;
		$.blockUI();
		$.post('savemap.php', {op: 'delete', map: $('select[name="map"]').val()}, function () {
			window.location.reload();
		});
	});
	
	$(document).ajaxStop(function() {
		$.unblockUI();
	});
	
	$('input[name="mapName"], input[name="mapWidth"], input[name="mapHeight"]').val('');
	$('input[type="radio"][name="mapType"][value="' + SELECTED_MAP_TYPE + '"]').click();
	$('input[type="radio"][name="objectType"][value="' + SELECTED_OBJECT_TYPE + '"]').click();
	$('input[type="checkbox"][name="showCoords"]').attr('checked', (SHOW_COORDS ? true : false));
});