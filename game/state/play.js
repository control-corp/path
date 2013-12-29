function GameStatePlay()
{
	this.mapRenderer = new GameMap(this);
	this.player = new GamePlayer(this.mapRenderer);
	this.done = false;
	
	camera.follow(this.player);
}

GameStatePlay.prototype.input = function()
{
	if (this.mapRenderer.mapIsLoaded === false) {
		return;
	}
	
	this.player.input();
}

GameStatePlay.prototype.logic = function()
{
	if (this.mapRenderer.mapIsLoaded === false) {
		return;
	}
	
	this.player.logic();
}

GameStatePlay.prototype.render = function()
{
    ctx.save();
    
    if (this.mapRenderer.mapIsLoaded === false) {
		this.mapRenderer.renderLoading();
	} else {
		this.mapRenderer.render();
	}
	
	ctx.restore();
}

GameStatePlay.prototype.getRequestedGameState = function()
{
	return this.requestedGameState;
}

GameStatePlay.prototype.isExitRequested = function()
{
	return this.done;
}