var Loader = {
	sources: {},
	isCompleted: false,
	load: function (imgs, onComplete) {
		this.isCompleted = false;
		var len    = imgs.length;
		var loaded = 0;
		imgs.forEach(function (asset) {
			Loader.sources[asset] = new Image();
			Loader.sources[asset].src = 'game/assets/' + asset;
			Loader.sources[asset].onload = function () {
				setTimeout(function () {
					loaded++;
				}/*, Math.floor(Math.random() * 5000)*/);
			};
		});
		var interval = window.setInterval(function () {
			if (typeof Loader.onLoad === 'function') {
				Loader.onLoad(len, loaded);
			}
			if (loaded === len) {
				setTimeout(function () {
					Loader.isCompleted = true;
					if (typeof onComplete === 'function') {
						onComplete();
					}
				}, 100);
				window.clearInterval(interval);
				return;
			}
		}, 100);
	},
	onLoad: function (total, loaded) {
		if (ctx === undefined || canvas === undefined) {
			console.log('no context or canvas');
			return;
		}
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = '20px Verdana';
		ctx.textAlign = 'center';
	    ctx.fillStyle = 'blue';
		ctx.fillText(Math.round((loaded / total) * 100) + '%', x, y);
		ctx.fillText('(' + loaded + ' of ' + total + ')', x, y + 30);
		ctx.restore();
	}
}