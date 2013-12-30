function AStar(params)
{
	this.map               = params.map || undefined;
	this.allowDiagonal     = params.allowDiagonal || true;
	this.dontCrossCorners  = params.dontCrossCorners || true;
	this.heuristicCallback = params.heuristic || undefined;
}

AStar.prototype.heuristic = function(from, to)
{
	var dx = Math.abs(to.x - from.x);
	var dy = Math.abs(to.y - from.y);
	var D  = 8;

	if (this.heuristicCallback !== undefined) {
		return D * this.heuristicCallback(dx, dy);
	}
	
	//return D * Math.max(dx, dy);
	//return D * (dx + dy);
	return D * Math.sqrt(dx * dx + dy * dy);
}

AStar.prototype.findPath = function(start, end, limit) 
{
	var limit = (limit || 1000), 
		open = [], 
		close = [], 
		lowest_score, 
		lowest_node, 
		lowest_index,
		foundInOpen,
		ng,
		neighbours,
		neighbour,
		newNode,
		i, l;
	
	var node = new AStarNode({
		x : start.x, 
		y : start.y,
		h : this.heuristic(start, end)
	});
	
	open.push(node);
		
	while (open.length && close.length < limit) {
		
		lowest_score = 1E+37;
		lowest_node  = null;
		lowest_index = 0;
		
		for (i = 0, l = open.length; i < l; ++i) {
			if (open[i].g + open[i].h < lowest_score) {
				lowest_score = open[i].g + open[i].h;
				lowest_node  = open[i];
				lowest_index = i;
			}
		}
		
		node = lowest_node;

		close.push(node);
		
		open.splice(lowest_index, 1);
		
		if (node.x == end.x && node.y == end.y) {
			break;
		}

		if (this.map === null) {
			neighbours = [];
		} else {
			neighbours = this.map.getNeighbours(node, this.allowDiagonal, this.dontCrossCorners);
		}

		for (i = 0, l = neighbours.length; i < l; ++i) {
		
			neighbour = neighbours[i];

			if (this.findInSet(neighbour, close) !== undefined) {
				continue;
			}

			foundInOpen = this.findInSet(neighbour, open);

			ng = node.g + ((neighbour.x - node.x === 0 || neighbour.y - node.y === 0) ? 1 : Math.SQRT2);
			
			if (foundInOpen === undefined) {
				newNode = new AStarNode({
					x : neighbour.x,
					y : neighbour.y,
					g : ng,
					h : this.heuristic(neighbour, end),
					parent : {
						x : node.x, 
						y : node.y
					}
				});
				open.push(newNode);
			} else {
				if (ng < foundInOpen.g) {
					foundInOpen.g = ng;
					foundInOpen.parent = {
						x : node.x, 
						y : node.y
					};
				}
			}
		}
	}

	return this.constructPath(node, start, end, close);
}

AStar.prototype.constructPath = function(node, start, end, set)
{
	var path = [];

	if (node.x != end.x || node.y != end.y) {
		return path;
		var lowest_score = 1E+37;
		var lowest_node  = null;
		for (i = 0, l = set.length; i < l; ++i) {
			if (set[i].h < lowest_score) {
				lowest_score = set[i].h;
				lowest_node  = set[i];
			}
		}
		node = lowest_node;
	}
	
	while (node.x != start.x || node.y != start.y) {
		path.push({
			x : node.x, 
			y : node.y
		});
		node = this.findInSet(node, set).parent;
	}
	
	return path.reverse();
}

AStar.prototype.findInSet = function(node, set)
{
	var found;
	var i;
	
	for (i in set) {
		if (node.x == set[i].x && node.y == set[i].y) {
			found = set[i];
			break;
		}
	}
	
	return found;
}

function AStarNode(p)
{
	this.x = p.x;
	this.y = p.y;
	this.g = p.g || 0;
	this.h = p.h || 0;
	this.parent = p.parent || null;
}