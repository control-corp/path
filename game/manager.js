function GameManager()
{
	this.currentState = new GameStatePlay();
	this.done = false;
}

GameManager.prototype.input = function()
{
	this.currentState.input();
	
	return this;
}

GameManager.prototype.logic = function()
{
	if (this.done === true) {
		return this;
	}
	
	var newState = this.currentState.getRequestedGameState();
	
	if (newState !== undefined) {
		delete this.currentState;
		this.currentState = newState;
	}
	
	this.currentState.logic();
	
	camera.logic();
	
	this.done = this.currentState.isExitRequested();
	
	return this;
}

GameManager.prototype.render = function()
{
	if (this.done === true) {
		return this;
	}
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.save();
    
	ctx.translate(-camera.x, -camera.y);
    
	this.currentState.render();
	
	ctx.restore();
	
	return this;
}