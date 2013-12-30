function GameStatePlay()
{
	this.done   = false;
	this.loaded = false;
}

GameStatePlay.prototype.init = function()
{
	Loader.load(['grassland.png', 'grass2.png', 'lordshade.png'], function () {
	    this.loaded      = true;
	    this.mapRenderer = new GameMap(this);
	    this.player      = new GamePlayer(this.mapRenderer);
		this.mapRenderer.initMap('map');
		gameCamera.follow(this.player);
	}, this);
}

GameStatePlay.prototype.input = function()
{
	if (this.loaded === false 
		|| this.mapRenderer.mapIsLoaded === false
	) {
		return this;
	}
	
	this.player.input();
	
	return this;
}

GameStatePlay.prototype.logic = function()
{
	if (this.loaded === false 
		|| this.mapRenderer.mapIsLoaded === false
	) {
		return this;
	}
	
	this.player.logic();
	
	gameCamera.logic();
}

GameStatePlay.prototype.render = function()
{
	if (this.loaded === false) {
		return this;
	}
	
    ctx.save();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.translate(-gameCamera.x, -gameCamera.y);
    
    if (this.mapRenderer.mapIsLoaded === false) {
		this.mapRenderer.renderLoading();
	} else {
		this.mapRenderer.render();
	}
	
	ctx.restore();
	
	return this;
}