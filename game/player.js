function GamePlayer(mapRenderer)
{
	this.x, 
	this.y, 
	this.z = 100,
	this.worldX, 
	this.worldY,
	this.idx = 0,
	this.speed = 1,
	this.target = undefined,
	this.newTarget = undefined,
	this.pathFollower = undefined,
	this.pathCurrent = 0,
	this.mapRenderer = mapRenderer,
	this.forcedStop = false;
	this.isMoving = false;
	;
}

GamePlayer.prototype.input = function()
{
	if (inputManager.pressed['mouse'] === true) {
		this.setTarget();
	}
	
	if (inputManager.pressed['esc'] === true && this.isMoving === true) {
		this.forcedStop = true;
	}
}

GamePlayer.prototype.move = function()
{
	if (this.pathFollower === undefined) {
		this.pathFollower = this.mapRenderer.findPath(this, this.target);
		if (this.pathFollower.length === 0) {
			return this.stopMove();
		}
	}
	
	var nextWorldX = this.pathFollower[this.pathCurrent].x * tileSize;
	var nextWorldY = this.pathFollower[this.pathCurrent].y * tileSize;
	
	if (this.pathCurrent < this.pathFollower.length) {
		if (Math.abs(this.worldX - nextWorldX) < this.speed && Math.abs(this.worldY - nextWorldY) < this.speed) {
			this.pathCurrent++;
			if (this.forcedStop) {
				return this.stopMove();
			}
			if (this._checkForNewTarget()) {
				return true;
			}
		}
	}

	if (this.pathFollower[this.pathCurrent] === undefined) {
		this.checkEvents();
		return this.stopMove();
	}
	
	return this._move();
}

GamePlayer.prototype._checkForNewTarget = function()
{
	var path;
	
	if (this.newTarget !== undefined) {
		path = this.mapRenderer.findPath(this, this.newTarget);
		if (path.length) {
			this.stopMove(path, this.newTarget);
			return true;
		}
	}
	
	return false;
}

GamePlayer.prototype.stopMove = function(newPath, newTarget)
{
	this.pathFollower = newPath || undefined;
	this.target = newTarget || undefined;
	this.newTarget = undefined;
	this.pathCurrent = 0;
	this.forcedStop = false;
	this.isMoving = false;
	
	return true;
}

GamePlayer.prototype._move = function()
{
	this.isMoving = true;
	
	var nextWorldX = this.pathFollower[this.pathCurrent].x * tileSize;
	var nextWorldY = this.pathFollower[this.pathCurrent].y * tileSize;

	if (this.worldX > nextWorldX) this.worldX = this.worldX - this.speed;
	if (this.worldX < nextWorldX) this.worldX = this.worldX + this.speed;
	if (this.worldY > nextWorldY) this.worldY = this.worldY - this.speed;
	if (this.worldY < nextWorldY) this.worldY = this.worldY + this.speed;

	if (Math.abs(this.worldX - nextWorldX) < this.speed && Math.abs(this.worldY - nextWorldY) < this.speed) {
		this.worldX = nextWorldX;
		this.worldY = nextWorldY;
		this.x = this.worldX >> tileShift;
		this.y = this.worldY >> tileShift;
		if (this.mapRenderer.grid.w) {
			this.idx = this.x + (this.y * this.mapRenderer.grid.w);
		}
	}
	
	return true;
}

GamePlayer.prototype.setTarget = function()
{
	var toX = inputManager.mouseX;
	var toY = inputManager.mouseY;

	if (this.target !== undefined 
		&& this.target.x == toX 
		&& this.target.y == toY
	) {
		return;
	}
	
	if (this.target === undefined) {
		this.target = {};
		this.target.x = toX;
		this.target.y = toY;
		if (this.mapRenderer.grid.w) {
			this.target.idx = toX + (toY * this.mapRenderer.grid.w);
		}
	} else {
		this.newTarget = {};
		this.newTarget.x = toX;
		this.newTarget.y = toY;
		this.newTarget.idx = toX + (toY * this.mapRenderer.grid.w);
	}
}

GamePlayer.prototype.logic = function()
{
	if (this.target !== undefined) {
		this.move();
	}
}

GamePlayer.prototype.render = function()
{
	ctx.save();
    ctx.beginPath();
    ctx.arc(this.worldX + tileSize / 2, this.worldY + tileSize / 2, tileSize / 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.restore();
    
	/*ctx.save();
	ctx.fillStyle = 'red';
	ctx.fillRect(this.worldX, this.worldY, tileSize, tileSize);
	ctx.restore();*/
	
	info.push('Player: (' + this.x + ', ' + this.y + '), idx: ' + this.idx + ', speed: ' + this.speed + ', isMoving: ' + Number(this.isMoving));
	
	if (this.target !== undefined) {
		info.push('Target: (' + this.target.x + ', ' + this.target.y + '), idx: ' + this.target.idx);
	}
}

GamePlayer.prototype.checkEvents = function()
{
	var events = this.mapRenderer.grid.events[this.target.idx], type, event;
	
	if (events !== undefined) {
		for (type in events) {
			event = events[type];
			switch (type) {
				case 'teleport' :
					var data = event.data.split(',');
					if (data[2]) {
						this.mapRenderer.setMap(data[2], function (map) {
							map.scene.player.setMapCoords(data[0], data[1]);
						});
					} else {
						this.setMapCoords(data[0], data[1]);
					}
					break;
				case 'exit' :
					alert(event.data);
					gameManager.currentState.done = true;
					break;
			}
		}
	}
}

GamePlayer.prototype.setMapCoords = function(x, y)
{
	if (x === undefined) {
		x = this.x;
	}
	
	if (y === undefined) {
		y = this.y;
	}

	this.x = parseInt(x);
	this.y = parseInt(y);
	
	this.worldX = x * tileSize;
	this.worldY = y * tileSize;
	
	this.idx = this.x + (this.y * this.mapRenderer.grid.w);
}