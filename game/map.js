function GameMap(scene)
{
	this.scene = scene;
	
	this.grid = {};
	
	this.mapIsLoaded = false;
}

GameMap.prototype.initMap = function(map)
{
	this.setMap(map, function (map) {
		map.scene.player.setMapCoords(0, 0);
	});
}

GameMap.prototype.getPathFinder = function()
{
	if (this.pathFinder === undefined) {
		this.pathFinder = new AStar({
			map: this
		});
	}
	
	return this.pathFinder;
}

GameMap.prototype.setMap = function(map, onLoad)
{
	this.grid        = {};
	this.mapIsLoaded = false;
	this.mapName     = map;
	
	var self = this;

	$.getJSON('game/maps/' + map + '.json?r' + new Date().getTime(), function (response) {
		setTimeout(function () {
			self.grid = response;
			self.mapIsLoaded = true;
			if (typeof onLoad === 'function') onLoad(self);
		}, 100);
	});
}

GameMap.prototype.findPath = function(from, to)
{
	var pathFollower = {
		path     : [], 
		modified : false
	};
	
	if (to === undefined 
		|| to.x < 0 
		|| to.y < 0
		|| to.x >= this.grid.w 
		|| to.y >= this.grid.h
		|| this.grid.collision[to.y] === undefined
		|| this.grid.collision[to.y][to.x] === undefined
		|| this.grid.collision[to.y][to.x] === 1
		|| (from.x == to.x && from.y == to.y)
	) {
		return pathFollower;
	}

	globalData.paths++;
	
	return this.getPathFinder().findPath(from, to);
}

GameMap.prototype.logic = function()
{

}

GameMap.prototype.renderLoading = function()
{
	ctx.save();
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = '10px Verdana';
	ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
	ctx.fillText('Loading "' + this.mapName + '"', canvas.width / 2, canvas.height / 2);
	ctx.restore();
}

GameMap.prototype.render = function()
{
	var startX = (gameCamera.x >> tileShift);
	var startY = (gameCamera.y >> tileShift);
	
	var endX = startX + (canvas.width >> tileShift);
	var endY = startY + (canvas.height >> tileShift);

	var wx, wy, idx, type, obj, gameObject;

	var objects = [];
	
	var additionalView = 3;
	
	for (var y = startY - additionalView; y < endY + additionalView; y++) {
		for (var x = startX - additionalView; x < endX + additionalView; x++) {
			if (x < 0 || y < 0 || x >= this.grid.w || y >= this.grid.h) {
				continue;
			}
			wx = x * tileSize;
			wy = y * tileSize;
			idx = x + (y * this.grid.w);
			obj = this.grid.objects[idx];
			if (obj !== undefined) {
				for (type in obj) {
					if (OBJECT_TYPES[type] === undefined) {
						continue;
					}
					gameObject = new GameMapObject();
					gameObject.type = type;
					gameObject.x = x;
					gameObject.y = y;
					gameObject.z = OBJECT_TYPES[type].z || 0;
					gameObject.worldX = wx,
					gameObject.worldY = wy
					objects.push(gameObject);
				}
			}
		}
	}
	
	objects.push(this.scene.player);
	
	objects.sort(sortZIndex);
	
	ctx.save();
	
	ctx.translate(-gameCamera.x, -gameCamera.y);
    
	objects.forEach(function (obj) {
		if (obj.render && typeof obj.render === 'function') {
			obj.render();
		}
	});
	
	if (this.scene.player.target !== undefined) {
		var tx = this.scene.player.target.x * tileSize;
		var ty = this.scene.player.target.y * tileSize;
		ctx.save();
	    ctx.beginPath();
	    ctx.arc(tx + tileSize / 2, ty + tileSize / 2, tileSize / 4, 0, 2 * Math.PI);
	    ctx.fillStyle = 'red';
	    ctx.fill();
	    ctx.lineWidth = 2;
	    ctx.strokeStyle = 'black';
	    ctx.stroke();
	    ctx.restore();
	}

	ctx.restore();
	
	info.push('Objects: ' + objects.length);
	
	delete objects;
}

GameMap.prototype.drawObject = function()
{
	
}

GameMap.prototype.getNeighbours = function(node, allowDiagonal, dontCrossCorners) 
{
	var neighbours = [],
		s0 = false, d0 = false,
		s1 = false, d1 = false,
		s2 = false, d2 = false,
		s3 = false, d3 = false
		;
	
	var x = node.x,
		y = node.y
		;
	
	// north
	if (this.grid.collision[y - 1] !== undefined 
		&& this.grid.collision[y - 1][x] === 0
	) {
		neighbours.push({
			x: x, 
			y: y - 1
		});
		s3 = true;
	}
	
	// east
	if (this.grid.collision[y][x + 1] !== undefined
		&& this.grid.collision[y][x + 1] === 0
	) {
		neighbours.push({
			x: x + 1, 
			y: y
		});
		s2 = true;
	}
	
	// south
	if (this.grid.collision[y + 1] !== undefined
		&& this.grid.collision[y + 1][x] === 0
	) {
		neighbours.push({
			x: x, 
			y: y + 1
		});
		s1 = true;
	}
	
	// west
	if (this.grid.collision[y][x - 1] !== undefined
		&& this.grid.collision[y][x - 1] === 0
	) {
		neighbours.push({
			x: x - 1, 
			y: y
		});
		s0 = true;
	}
	
	if (!allowDiagonal) {
		return neighbours;
	}
	
	if (dontCrossCorners) {
        d0 = s3 && s0; // northwest
        d1 = s0 && s1; // southwest
        d2 = s1 && s2; // southeast
        d3 = s2 && s3; // northeast
    } else {
        d0 = s3 || s0; // northwest
        d1 = s0 || s1; // southwest
        d2 = s1 || s2; // southeast
        d3 = s2 || s3; // northeast
    }
	
	if (d0
		&& this.grid.collision[y - 1] !== undefined
		&& this.grid.collision[y - 1][x - 1] !== undefined
		&& this.grid.collision[y - 1][x - 1] === 0
	) { // northwest
		neighbours.push({
			x: x - 1, 
			y: y - 1
		});
	}
	
	if (d1
		&& this.grid.collision[y + 1] !== undefined
		&& this.grid.collision[y + 1][x - 1] !== undefined
		&& this.grid.collision[y + 1][x - 1] === 0
	) { // southwest
		neighbours.push({
			x: x - 1, 
			y: y + 1
		});
	}
	
	if (d2
		&& this.grid.collision[y + 1] !== undefined
		&& this.grid.collision[y + 1][x + 1] !== undefined
		&& this.grid.collision[y + 1][x + 1] === 0
	) { // southeast
		neighbours.push({
			x: x + 1, 
			y: y + 1
		});
	}
	
	if (d3
		&& this.grid.collision[y - 1] !== undefined
		&& this.grid.collision[y - 1][x + 1] !== undefined
		&& this.grid.collision[y - 1][x + 1] === 0
	) { // northeast
		neighbours.push({
			x: x + 1, 
			y: y - 1
		});
	}
	
	return neighbours;
}

function GameMapObject()
{
	this.render = function () {
		ctx.save();
		var objInfo = OBJECT_TYPES[this.type];
		if (objInfo !== undefined) {
			if (objInfo.asset && Loader.sources[objInfo.asset] !== undefined) {
				ctx.drawImage(Loader.sources[objInfo.asset], 
					objInfo.x, objInfo.y, objInfo.w, objInfo.h, 
					this.worldX + objInfo.offX, this.worldY + objInfo.offY, objInfo.w, objInfo.h
				);
			} else if (objInfo.color) {
				ctx.fillStyle = objInfo.color;
				ctx.fillRect(this.worldX, this.worldY, tileSize, tileSize);
			} else {
				console.log('Cannot draw "' + this.type + '"');
			}
		}
		ctx.restore();
	};
}