function GameStatePlay()
{
	this.mapRenderer = new GameMap();
	this.player = new GamePlayer(this.mapRenderer);
	
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
		this.player.render();
	}
	
	ctx.restore();
}

GameStatePlay.prototype.getRequestedGameState = function()
{
	return null;
}

GameStatePlay.prototype.isExitRequested = function()
{
	return false;
}