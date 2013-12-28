function GameManager()
{
	this.currentState = new GameStatePlay();
	this.done = false;
}

GameManager.prototype.input = function()
{
	this.currentState.input();
}

GameManager.prototype.logic = function()
{
	var newState = this.currentState.getRequestedGameState();
	
	if (newState !== null) {
		delete this.currentState;
		this.currentState = newState;
	}
	
	this.currentState.logic();
	
	camera.logic();
	
	this.done = this.currentState.isExitRequested();
}

GameManager.prototype.render = function()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.save();
    
	ctx.translate(-camera.x, -camera.y);
    
	this.currentState.render();
	
	ctx.restore();
}