function GameCamera()
{
	this.x = 0, 
	this.y = 0
	this.target;
}

GameCamera.prototype.follow = function(target)
{
	this.target = target;
}

GameCamera.prototype.logic = function()
{
	if (this.target === undefined || canvas === undefined) {
		return;
	}
	
	this.x = Math.floor(this.target.worldX - canvas.width / 2);
	this.y = Math.floor(this.target.worldY - canvas.height / 2);

	if (tileSize 
		&& this.target.mapRenderer 
		&& this.target.mapRenderer.grid
	) {
		if (this.x < 0) 
			this.x = 0;
		if (this.y < 0) 
			this.y = 0;
		if (this.x + canvas.width > (this.target.mapRenderer.grid.w * tileSize)) 
			this.x = (this.target.mapRenderer.grid.w * tileSize) - canvas.width;
		if (this.y + canvas.height > (this.target.mapRenderer.grid.h * tileSize)) 
			this.y = (this.target.mapRenderer.grid.h * tileSize) - canvas.height;
	}
}