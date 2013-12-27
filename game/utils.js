function isInsideCanvas(worldX, worldY, width, height)
{
	return -canvas.worldX + worldX + width > 0 
		   && -canvas.worldY + worldY + height > 0 
		   && -canvas.worldX + worldX < canvas.width 
		   && -canvas.worldY + worldY < canvas.height;
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