function GamePlayer(mapRenderer)
{
	this.x, 
	this.y, 
	this.z = 100,
	this.worldX, 
	this.worldY,
	this.idx = 0,
	this.speed = 1,
	this.pathNext = undefined,
	this.pathFollower = undefined;
	this.mapRenderer = mapRenderer,
	this.forceStop = false;
	this.isMoving = false;
	this.angle = 0;
	this.orders = [];
	;
}

GamePlayer.prototype.setTarget = function(x, y)
{
	if (typeof x === 'object') {
		x = x.x;
		y = x.y;
	}
	
	if (this.target !== undefined 
		&& this.target.x === x 
		&& this.target.y === y
	) {
		return;
	}
	
	this.orders.push({
		type  : 'target',
		x     : x, 
		y     : y,
		idx   : (x + (y * this.mapRenderer.grid.w)),
		dirty : true
	});
}

GamePlayer.prototype.input = function()
{
	if (inputManager.pressed['mouse'] === true) {
		this.setTarget(inputManager.mouseX, inputManager.mouseY);
	}
	
	if (inputManager.pressed['esc'] === true 
		&& this.isMoving === true
	) {
		this.forceStop = true;
	}
}

GamePlayer.prototype.logic = function()
{
	var order = this.orders.pop();

	if (order !== undefined) {
		switch (order.type) {
			case 'target' :
				this.target = order;
				break;
		}
	}
	
	this.move();
}

GamePlayer.prototype.move = function()
{
	if (this.target === undefined) {
		return;
	}
	
	if (this.pathFollower === undefined) {
		
		this.pathFollower = this.mapRenderer.findPath(this, this.target);
		
		if (this.pathFollower.path.length !== 0) {

			this.target.dirty = false;
			
			this.pathNext    = this.pathFollower.path.pop();
			this.pathNext.x *= tileSize;
			this.pathNext.y *= tileSize;
		}
	}
	
	if (this.pathNext === undefined) {
		return this._moveStop();
	}

	this.isMoving = true;

	var newWorldX = this.worldX + this.speed * Math.cos(this.angle);
    var newWorldY = this.worldY + this.speed * Math.sin(this.angle);

    var dx = this.pathNext.x - newWorldX;
    var dy = this.pathNext.y - newWorldY;
 
    if ((dx * dx) + (dy * dy) < (this.speed * this.speed)) {

    	this.worldX = this.pathNext.x;
		this.worldY = this.pathNext.y;
		
		this.x = this.worldX >> tileShift;
		this.y = this.worldY >> tileShift;
		
		this.idx = this.x + (this.y * this.mapRenderer.grid.w);
		
		this._checkForEvents();
		
		this._checkForStop();
		
		this._checkForNewTarget();
		
		if (this.pathFollower !== undefined) { // check for sure if moving is stopped
			this.pathNext = this.pathFollower.path.pop(); // next path
			if (this.pathNext !== undefined) {
				this.pathNext.x *= tileSize;
				this.pathNext.y *= tileSize;
			}
		}
		
    } else {
    	
    	this.worldX = newWorldX;
    	this.worldY = newWorldY;
    	
    	this._calcAngle(dx, dy);
    }
}

GamePlayer.prototype._calcAngle = function(dx, dy)
{
	this.angle = Math.atan2(dy, dx);
}

GamePlayer.prototype._checkForStop = function()
{
	if (this.forceStop === true) {
		this._moveStop();
	}
}

GamePlayer.prototype._checkForNewTarget = function()
{
	if (this.target === undefined
		|| this.target.dirty === false
	) {
		return;
	}

	var pathFollower = this.mapRenderer.findPath(this, this.target);

	if (pathFollower.path.length) {
		this.pathFollower = pathFollower;
	}
}

GamePlayer.prototype._moveStop = function()
{
	this.pathFollower = undefined;
	this.pathNext     = undefined;
	this.target       = undefined;
	this.forceStop    = false;
	this.isMoving     = false;
	
	return true;
}

GamePlayer.prototype.render = function()
{
	/*ctx.save();
    ctx.beginPath();
    ctx.arc(this.worldX + tileSize / 2, this.worldY + tileSize / 2, tileSize / 4, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.restore();*/
    
	var cx = this.worldX + tileSize / 2;
	var cy = this.worldY + tileSize / 2;
	
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(this.angle);
	ctx.translate(-cx, -cy);
	ctx.fillStyle = 'green';
	//ctx.beginPath();
	//ctx.rect(this.worldX, this.worldY, tileSize, tileSize);
	//ctx.stroke();
	ctx.fillRect(this.worldX, this.worldY + tileSize / 4, tileSize / 2 + 1, tileSize / 2 + 1);
	ctx.beginPath();
	ctx.moveTo(cx, cy - tileSize / 2);
	ctx.lineTo(cx + tileSize / 2, cy);
	ctx.lineTo(cx, cy + tileSize / 2);
	ctx.fill();
	ctx.restore();
	
	/*ctx.save();
	ctx.fillStyle = 'red';
	ctx.translate(cx, cy);
	ctx.rotate(this.angle);
	ctx.translate(-cx, -cy);
	ctx.fillRect(this.worldX, this.worldY, tileSize, tileSize);
	ctx.restore();*/
	
	info.push('Player: (' + this.x + ', ' + this.y + '), idx: ' + this.idx + ', speed: ' + this.speed + ', isMoving: ' + Number(this.isMoving));
	
	if (this.target !== undefined) {
		info.push('Target: (' + this.target.x + ', ' + this.target.y + '), idx: ' + this.target.idx);
	}
}

GamePlayer.prototype._checkForEvents = function()
{
	this._triggerEvents(this.mapRenderer.grid.events[this.idx]);
}

GamePlayer.prototype._triggerEvents = function (events)
{
	if (events === undefined) {
		return;
	}
	
	var type, event, params, data;
	
	for (type in events) {
		params = events[type];
		event  = EVENT_TYPES[type];
		switch (type) {
			case 'teleport' :
				this._moveStop();
				inputManager.pressed['mouse'] = false;
				data = params.data.split(',');
				if (data[2]) {
					this.mapRenderer.setMap(data[2], function (map) {
						map.scene.player.setMapCoords(data[0], data[1]);
					});
				} else {
					this.setMapCoords(data[0], data[1]);
				}
				break;
			case 'exit' :
				alert(params.data);
				gameManager.currentState.done = true;
				break;
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