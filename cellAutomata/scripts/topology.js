/**
* Lays items out on a 2D surface
*/
function Topology(x, y, width, height) {
	this.items = [];
	this.bounds = { "x":x, "y":y, "width":width, "height":height };
	this.quadTree = null;
	this.options = { "showNodes":true };
	this.init();
}

Topology.prototype.render = function(ctx) {
	// TODO: display tree quadrons
	function drawNode(node) {
		var cn = null, i = 0, bounds = null;
		for (i = 0; i < 4; i++) {
			cn = node.nodes[i];
			if (cn) {
				drawNode(cn)
			}	else {
					bounds = node._bounds;
					ctx.beginPath();
					ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height);
					ctx.stroke();
				}
			}
		}
		if (this.options.showNodes) {
			ctx.strokeStyle = "#080808";
			ctx.lineWidth = 1;
			drawNode(this.quadTree.root);
		}

		// Draw all the items on screen
		ctx.fillStyle = "#888888";
		for (i=0, end=this.size; i < end; i++) {
			// TODO: use the class method to draw, but call it as a static method
			// with the parameters required.
			this.items[i].render(ctx);
		}
}

Topology.prototype.add = function(item) {
	this.items.push(item);
	this.size = this.items.length;
}

/**
* Translates values from a property into something that can be rendered,
* usually as x, y and color space.
*/
Topology.prototype.translate = function() {
	// TODO: map to bounds, support zooming etc?
}

Topology.prototype.init = function() {
	// TODO: Use QuadTree, but add an option to use kdTree later
	//this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
	var pointQuad = true,
		maxDepth = 32,
		maxChildren = 4;
	this.quadTree = new QuadTree(this.bounds, pointQuad, maxDepth, maxChildren);

}
Topology.prototype.update = function() {
	// Update the QuadTree
	this.quadTree.clear();
	this.quadTree.insert(this.items);

	// FIXME add using quadtree
	/*var nearest = self.mouse==null ? [] :
	self.quadTree.retrieve({x:self.mouse.x,y:self.mouse.y,height:100,width:100});
	var diff = self.root.lastdots.diff(nearest);*/
}
Topology.prototype.insert = function(item) {
	this.quadTree.insert(item);
}
