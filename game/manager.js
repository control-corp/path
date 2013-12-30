function GameManager()
{
	this.currentState = new GameStatePlay();
	this.done = false;
	
	this.init();
}

GameManager.prototype.init = function()
{
	if (typeof this.currentState.init === 'function') {
		this.currentState.init();
	}
}

GameManager.prototype.input = function()
{
	if (this.done === true) {
		return this;
	}
	
	this.currentState.input();
	
	return this;
}

GameManager.prototype.logic = function()
{
	if (this.done === true) {
		return this;
	}
	
	var newState = this.currentState.newGameState;
	
	if (newState !== undefined) {
		delete this.currentState;
		this.currentState = newState;
		if (typeof this.currentState.init === 'function') {
			this.currentState.init();
		}
	}
	
	this.currentState.logic();

	this.done = this.currentState.done;
	
	return this;
}

GameManager.prototype.render = function()
{
	if (this.done === true) {
		return this;
	}
	
	this.currentState.render();
	
	return this;
}