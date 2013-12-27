function GamePlayer(mapRenderer)
{
	this.mapX = 0;
	this.mapY = 0;
	this.worldX = this.mapX * tileSize;
	this.worldY = this.mapY * tileSize;
	this.speed = 3;
	this.target = undefined;
	this.newTarget = undefined;
	this.pathFollower = undefined;
	this.pathCurrent = 0;
	this.mapRenderer = mapRenderer;
}

GamePlayer.prototype.input = function()
{
	if (gInput.pressed['mouse']) {
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

	if (this.pathCurrent < this.pathFollower.length) {
		if (Math.abs(this.worldX - this.pathFollower[this.pathCurrent].worldX) < this.speed 
			&& Math.abs(this.worldY - this.pathFollower[this.pathCurrent].worldY) < this.speed
		) {
			this.pathCurrent++;
			if (this.newTarget !== undefined) {
				var newPath = this.mapRenderer.findPath(this, this.newTarget);
				if (newPath.length) {
					return this._stopMove(newPath, this.newTarget);
				}
			}
		}
	}

	if (this.pathFollower[this.pathCurrent] === undefined) {
		this.checkEvents();
		return this._stopMove();
	}
	
	return this._move();
}

GamePlayer.prototype._stopMove = function(newPath, newTarget)
{
	this.pathFollower = newPath || undefined;
	this.target = newTarget|| undefined;
	this.newTarget = undefined;
	this.pathCurrent = 0;
	
	return true;
}

GamePlayer.prototype._move = function()
{
	var nextWorldX = this.pathFollower[this.pathCurrent].worldX;
	var nextWorldY = this.pathFollower[this.pathCurrent].worldY;
	
	if (this.worldX > nextWorldX) this.worldX = this.worldX - this.speed;
	if (this.worldX < nextWorldX) this.worldX = this.worldX + this.speed;
	if (this.worldY > nextWorldY) this.worldY = this.worldY - this.speed;
	if (this.worldY < nextWorldY) this.worldY = this.worldY + this.speed;
	
	if (Math.abs(this.worldX - nextWorldX) < this.speed 
		&& Math.abs(this.worldY - nextWorldY) < this.speed
	) {
		this.worldX = nextWorldX;
		this.worldY = nextWorldY;
		this.mapX = this.worldX >> tileShift;
		this.mapY = this.worldY >> tileShift;
	}
	
	return true;
}

GamePlayer.prototype.setTarget = function()
{
	var toMapX = canvas.mouseMapX;
	var toMapY = canvas.mouseMapY;

	if (this.target !== undefined 
		&& this.target.mapX == toMapX 
		&& this.target.mapY == toMapY
	) {
		return;
	}
	
	if (this.target === undefined) {
		this.target = {};
		this.target.mapX = toMapX;
		this.target.mapY = toMapY;
	} else {
		this.newTarget = {};
		this.newTarget.mapX = toMapX;
		this.newTarget.mapY = toMapY;
	}
}

GamePlayer.prototype.logic = function()
{
	if (this.target !== undefined) {
		this.move();
	}
	
	canvas.worldX = Math.floor(this.worldX - canvas.width / 2);
	canvas.worldY = Math.floor(this.worldY - canvas.height / 2);

	if (this.mapRenderer.mapIsLoaded) {
		if (canvas.worldX < 0) canvas.worldX = 0;
		if (canvas.worldX + canvas.width > (this.mapRenderer.grid.w * tileSize)) canvas.worldX = (this.mapRenderer.grid.w * tileSize) - canvas.width;
		if (canvas.worldY < 0) canvas.worldY = 0;
		if (canvas.worldY + canvas.height > (this.mapRenderer.grid.h * tileSize)) canvas.worldY = (this.mapRenderer.grid.h * tileSize) - canvas.height;
	}

	canvas.mapX = canvas.worldX >> tileShift;
	canvas.mapY = canvas.worldY >> tileShift;
}


GamePlayer.prototype.render = function()
{
	ctx.save();
	ctx.beginPath();
	ctx.arc(this.worldX + tileSize / 2, this.worldY + tileSize / 2, tileSize / 4, 0, 2 * Math.PI);
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.restore();
	
	info.push('Player: (' + this.mapX + ', ' + this.mapY + ')');
	
	if (this.target !== undefined) {
		info.push('Target: (' + this.target.mapX + ', ' + this.target.mapY + ')');
	}
}

GamePlayer.prototype.checkEvents = function()
{
	var idx = (this.target.mapX + (this.target.mapY * this.mapRenderer.grid.w));
	
	if (!(idx in this.mapRenderer.grid.data)) {
		return;
	}
	
	var cell = this.mapRenderer.grid.data[idx];
	
	if (cell.isPortal()) {
		alert('Ta daaaa');
	}
}