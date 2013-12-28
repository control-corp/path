var MAP_CELL_OBSTACLE = 1;
var MAP_CELL_PORTAL   = 2;

function GameMapCell(value)
{
	if (value instanceof Array) {
		this.value  = parseInt(value[0]);
		this.params = value[1]; 
	} else {
		this.value = parseInt(value);
	}
}

GameMapCell.prototype.isWalkable = function()
{
	return (this.value !== MAP_CELL_OBSTACLE);
}

GameMapCell.prototype.isPortal = function()
{
	return (this.value === MAP_CELL_PORTAL);
}

function GameMap()
{
	this.setMap('map.json');
	
	this.pathFinder = new AStar({map: this});
}

GameMap.prototype.setMap = function(map)
{
	this.grid = {};
	this.mapIsLoaded = false;
	
	var self = this;
	
	$.getJSON('game/maps/' + map + '?r' + new Date().getTime(), function (response) {
		var idx, x, y, w, h;
		self.grid = response;
		for (y = 0, h = self.grid.h; y < h; y++) {
			for (x = 0, w = self.grid.w; x < w; x++) {
				idx = (x + (y * w));
				if (self.grid.data[idx] !== undefined) {
					self.grid.data[idx] = new GameMapCell(self.grid.data[idx]);
				}
			}
		}
		setTimeout(function () {
			self.mapIsLoaded = true;
		}, 0);
	});
}

GameMap.prototype.findPath = function(from, to)
{
	var path = [];
	
	if (to === undefined 
		|| to.x < 0 
		|| to.y < 0
		|| to.x >= this.grid.w 
		|| to.y >= this.grid.h
		|| (from.x == to.x && from.y == to.y)
	) {
		return path;
	}
		
	var idx = (to.x + (to.y * this.grid.w));
	
	if (this.grid.data[idx] !== undefined && !this.grid.data[idx].isWalkable()) {
		return path;
	}

	if (this.pathFinder.map === null) {
		return path;
	}
	
	path = this.pathFinder.findPath(from, to);

	gDebugPaths++;
	
	return path;
}

GameMap.prototype.logic = function()
{

}

GameMap.prototype.renderLoading = function()
{
	ctx.save();
	ctx.font = '30px Calibri';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
	ctx.restore();
}

GameMap.prototype.render = function()
{
	ctx.save();

	var startX = camera.x >> tileShift;
	var startY = camera.y >> tileShift;
	
	var endX = startX + (canvas.width >> tileShift)  + 1;
	var endY = startY + (canvas.height >> tileShift) + 1;

	var c = 0, cell, wx, wy, idx;

	for (var y = startY; y < endY; y++) {
		for (var x = startX; x < endX; x++) {
			
			if (x < 0 || y < 0 || x >= this.grid.w || y >= this.grid.h) {
				continue;
			}
			
			wx = x * tileSize;
			wy = y * tileSize;
			
			idx = (x + (y * this.grid.w));
			
			if (this.grid.data[idx] !== undefined) {
				cell = this.grid.data[idx];
				if (cell.isWalkable()) {
					if (cell.isPortal()) {
						ctx.fillStyle = 'yellow';
						ctx.fillRect(wx, wy, tileSize, tileSize);
						c++;
					}
				} else {
					ctx.fillStyle = 'black';
					ctx.fillRect(wx, wy, tileSize, tileSize);
					c++;
				}
			} else {
				ctx.fillStyle = 'white';
				ctx.fillRect(wx, wy, tileSize, tileSize);
				//ctx.strokeStyle = 'black';
				//ctx.strokeRect(wx, wy, tileSize, tileSize);
			}
			
			//ctx.fillText(idx, wx + 2, wy + 10);
		}
	}
	
	ctx.restore();
	
	info.push('Objects: ' + c);
}

GameMap.prototype.getNeighbours = function(node, allowDiagonal, dontCrossCorners) 
{
	var neighbours = [],
		s0 = false, d0 = false,
		s1 = false, d1 = false,
		s2 = false, d2 = false,
		s3 = false, d3 = false;
	
	var i, 
		dir, 
		directions = [], 
		w = this.grid.w,
		h = this.grid.h,
		idx;
	
	// north
	var north = {x: node.x, y: node.y - 1};
	idx = (north.x + (north.y * w));
	
	if (north.y >= 0 && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
		neighbours.push({x: north.x, y: north.y});
		s3 = true;
	}
	
	// east
	var east = {x: node.x + 1, y: node.y};
	idx = (east.x + (east.y * w));
	
	if (east.x < w && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
		neighbours.push({x: east.x, y: east.y});
		s2 = true;
	}
	
	// south
	var south = {x: node.x, y: node.y + 1};
	idx = (south.x + (south.y * w));
	
	if (south.y < h && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
		neighbours.push({x: south.x, y: south.y});
		s1 = true;
	}
	
	// west
	var west = {x: node.x - 1, y: node.y};
	idx = (west.x + (west.y * w));
	
	if (west.x >= 0 && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
		neighbours.push({x: west.x, y: west.y});
		s0 = true;
	}
	
	if (allowDiagonal) {
		
		if (dontCrossCorners) {
	        d0 = s3 && s0;
	        d1 = s0 && s1;
	        d2 = s1 && s2;
	        d3 = s2 && s3;
	    } else {
	        d0 = s3 || s0;
	        d1 = s0 || s1;
	        d2 = s1 || s2;
	        d3 = s2 || s3;
	    }
		
		// northeast
		var northeast = {x: node.x + 1, y: node.y - 1};
		idx = (northeast.x + (northeast.y * w));
		
		if (d3 && northeast.x < w && northeast.y >= 0 && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
			neighbours.push({x: northeast.x, y: northeast.y});
		}
		
		// southeast
		var southeast = {x: node.x + 1, y: node.y + 1};
		idx = (southeast.x + (southeast.y * w));
		
		if (d2 && southeast.x < w && southeast.y < h && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
			neighbours.push({x: southeast.x, y: southeast.y});
		}
		
		// southwest
		var southwest = {x: node.x - 1, y: node.y + 1};
		idx = (southwest.x + (southwest.y * w));
		
		if (d1 && southwest.x >= 0 && southwest.y < h && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
			neighbours.push({x: southwest.x, y: southwest.y});
		}
		
		// northeast
		var northeast = {x: node.x - 1, y: node.y - 1};
		idx = (northeast.x + (northeast.y * w));
		
		if (d0 && northeast.x >= 0 && northeast.y >= 0 && (this.grid.data[idx] === undefined || this.grid.data[idx].isWalkable())) {
			neighbours.push({x: northeast.x, y: northeast.y});
		}
	}
	
	return neighbours;
}