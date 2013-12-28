function GamePlayer(mapRenderer)
{
	this.x, 
	this.y, 
	this.worldX, 
	this.worldY,
	this.speed = 5,
	this.target = undefined,
	this.newTarget = undefined,
	this.pathFollower = undefined,
	this.pathCurrent = 0,
	this.mapRenderer = mapRenderer
	;
	
	this.setMapCoords(0, 0);
}

GamePlayer.prototype.input = function()
{
	if (inputManager.pressed['mouse']) {
		this.setTarget();
	}
}

GamePlayer.prototype.move = function()
{
	if (this.pathFollower === undefined) {
		this.pathFollower = this.mapRenderer.findPath(this, this.target);
		if (this.pathFollower.length === 0) {
			return this._stopMove();
		}
	}

	var nextWorldX = this.pathFollower[this.pathCurrent].x * tileSize;
	var nextWorldY = this.pathFollower[this.pathCurrent].y * tileSize;
	
	if (this.pathCurrent < this.pathFollower.length) {
		if (Math.abs(this.worldX - nextWorldX) < this.speed && Math.abs(this.worldY - nextWorldY) < this.speed) {
			this.pathCurrent++;
			if (this._checkForNewTarget()) {
				return true;
			}
		}
	}

	if (this.pathFollower[this.pathCurrent] === undefined) {
		this.checkEvents();
		return this._stopMove();
	}
	
	return this._move();
}

GamePlayer.prototype._checkForNewTarget = function()
{
	var path;
	
	if (this.newTarget !== undefined) {
		path = this.mapRenderer.findPath(this, this.newTarget);
		if (path.length) {
			this._stopMove(path, this.newTarget);
			return true;
		}
	}
	
	return false;
}

GamePlayer.prototype._stopMove = function(newPath, newTarget)
{
	this.pathFollower = newPath || undefined;
	this.target = newTarget || undefined;
	this.newTarget = undefined;
	this.pathCurrent = 0;
	
	return true;
}

GamePlayer.prototype._move = function()
{
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
	} else {
		this.newTarget = {};
		this.newTarget.x = toX;
		this.newTarget.y = toY;
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
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    
	/*ctx.save();
	ctx.fillStyle = 'red';
	ctx.fillRect(this.worldX, this.worldY, tileSize, tileSize);
	ctx.restore();*/
	
	info.push('Player: (' + this.x + ', ' + this.y + ')');
	
	if (this.target !== undefined) {
		info.push('Target: (' + this.target.x + ', ' + this.target.y + ')');
	}
}

GamePlayer.prototype.checkEvents = function()
{
	var idx = (this.target.x + (this.target.y * this.mapRenderer.grid.w));
	
	if (!(idx in this.mapRenderer.grid.data)) {
		return;
	}
	
	var cell = this.mapRenderer.grid.data[idx];
	
	if (cell.isPortal()) {
		this.setMapCoords(0, 0);
		this.mapRenderer.setMap(idx + '.json');
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

	this.x = x;
	this.y = y;
	
	this.worldX = x * tileSize;
	this.worldY = y * tileSize;
}