function GameStatePlay()
{
	this.mapRenderer = new GameMap();
	this.player = new GamePlayer(this.mapRenderer);
}

GameStatePlay.prototype.input = function()
{
	this.player.input();
}

GameStatePlay.prototype.logic = function()
{
	this.player.logic();
}

GameStatePlay.prototype.render = function()
{
	this.mapRenderer.render();
	
	this.player.render();
}

GameStatePlay.prototype.getRequestedGameState = function()
{
	return null;
}

GameStatePlay.prototype.isExitRequested = function()
{
	return false;
}