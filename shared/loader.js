var Loader = {
	path: 'game/assets/',
	sources: {},
	isCompleted: false,
	intervalTime: 100,
	load: function (imgs, onComplete, context) {
		this.isCompleted = false;
		var len    = imgs.length;
		var loaded = 0;
		imgs.forEach(function (asset) {
			if (Loader.sources[asset]) {
				loaded++;
				return;
			}
			Loader.sources[asset] = new Image();
			Loader.sources[asset].src = Loader.path + asset;
			Loader.sources[asset].onload = function () {
				setTimeout(function () {
					loaded++;
				}/*, Math.floor(Math.random() * 5000)*/);
			};
		});
		var interval = window.setInterval(function () {
			if (typeof Loader.onLoad === 'function') {
				Loader.onLoad(len, loaded, context);
			}
			if (loaded === len) {
				setTimeout(function () {
					Loader.isCompleted = true;
					if (typeof onComplete === 'function') {
						onComplete.call(context);
					}
				}, 100);
				window.clearInterval(interval);
				return;
			}
		}, Loader.intervalTime);
	},
	onLoad: function (total, loaded, context) {
		if (ctx === undefined || canvas === undefined) {
			console.log('no context or canvas');
			return;
		}
		var x = canvas.width / 2;
		var y = canvas.height / 2;
		ctx.save();
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = '10px Verdana';
		ctx.textAlign = 'center';
	    ctx.fillStyle = 'white';
	    var n = getObjectClass(context);
		ctx.fillText('Loading ' + (n ? n : '') + ' ' + Math.round((loaded / total) * 100) + '%', x, y);
		ctx.fillText('(' + loaded + ' of ' + total + ')', x, y + 30);
		ctx.restore();
	}
}