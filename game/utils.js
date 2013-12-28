function isInsideCanvas(worldX, worldY, width, height)
{
	return -camera.x + worldX + width > 0 
		   && -camera.y + worldY + height > 0 
		   && -camera.x + worldX < canvas.width 
		   && -camera.y + worldY < canvas.height;
}

function xyToIdx(x, y, w)
{
	return (x + (y * w));
}

function idxToX(idx, w)
{
	return idx % w;
}

function idxToY(idx, w, x)
{
	var x = (x || idxToX(idx, w));
	
	return (idx - x) / w;
}

(function() {
	window.requestAnimationFrame = window.requestAnimationFrame 
	|| window.mozRequestAnimationFrame 
	|| window.webkitRequestAnimationFrame 
	|| window.msRequestAnimationFrame;
})();