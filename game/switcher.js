function GameSwitcher()
{
	this.currentState = new GameStatePlay();
	this.done = false;
}

GameSwitcher.prototype.input = function()
{
	this.currentState.input();
}

GameSwitcher.prototype.logic = function()
{
	var newState = this.currentState.getRequestedGameState();
	
	if (newState !== null) {
		delete this.currentState;
		this.currentState = newState;
	}
	
	this.currentState.logic();
	
	this.done = this.currentState.isExitRequested();
}

GameSwitcher.prototype.render = function()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
    ctx.save();
    
    ctx.translate(-canvas.worldX, -canvas.worldY);
    
	this.currentState.render();
	
	ctx.restore();
}