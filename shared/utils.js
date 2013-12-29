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

function pointRectangleIntersection(p, r) 
{
    return p.x > r.x1 && p.x < r.x2 && p.y > r.y1 && p.y < r.y2;
}

function sortZIndex(a, b) {
	if (a.z < b.z) return -1;
	if (a.z > b.z) return 1;
	return 0;
}

(function() {
	window.requestAnimationFrame = window.requestAnimationFrame 
	|| window.mozRequestAnimationFrame 
	|| window.webkitRequestAnimationFrame 
	|| window.msRequestAnimationFrame;
})();