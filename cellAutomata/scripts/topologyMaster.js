/**
* Generates workers to perform its job as Topology does, but threaded.
*/
function TopologyMaster(x, y, width, height) {
	this.ready = true;
	this.updated = true;
	this.wCells = new Worker("scripts/workerCells.js")
	this.wCells.owner = this;
	this.wResult = {"items":[], "updated":true};
	this.items = [];
	this.size = 0;
	this.bounds = { "x":x, "y":y, "width":width, "height":height };
	this.quadTree = null;
	this.vfield = new VField(
		[Math.floor(this.bounds.width/10),
		 Math.floor(this.bounds.height/10)],
		this
	);
	this.options = { "showNodes":true, "pointQuad":false };
	this.wCells.onmessage = this.workerMessage;
	this.init();
}

TopologyMaster.prototype.workerMessage = function(e){
	//console.log("message",e.data.items[0]);
	//if(e.data.items.length > 0)debugger;
	game.topo.wResult.items = e.data.items;
	game.topo.wResult.updated = true;
	//game.topo.ready = true;
	//if(game.topo.readyr;
}

TopologyMaster.prototype.isUpdated = function() {
	return ( this.wResult.updated && this.vfield.updated );
}

TopologyMaster.prototype.isReady = function() {
	if( this.wResult.updated && this.vfield.ready ){
		this.ready == true;
		this.updated == true;
	} else {
		this.ready == false;
	}
	return this.ready;
}

TopologyMaster.prototype.render = function(ctx) {
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
		ctx.strokeStyle = "#222";
		ctx.lineWidth = 1;
		drawNode(this.quadTree.root);
	}

	// Show the vector field
	//this.vfield.render(ctx);
	ctx.fillStyle = "rgba(0, 255, 0, 0.05)";
	//ctx.fillStyle = "rgb(0, 55, 0)";
	this.vfield.render(ctx);

	// Draw all the items on screen
	ctx.fillStyle = "rgb(255, 255, 255)";
	for (i=0, end=this.size; i < end; i++) {
		// TODO: use the class method to draw, but call it as a static method
		// with the parameters required.
		this.items[i].render(ctx);
	}
}

TopologyMaster.prototype.add = function(item) {
	this.items.push(item);
	this.size = this.items.length;
	this.vfield.node.items = this.items;
}

/**
* Translates values from a property into something that can be rendered,
* usually as x, y and color space.
*/
TopologyMaster.prototype.translate = function() {
	// TODO: map to bounds, support zooming etc?
}

TopologyMaster.prototype.init = function() {
	// TODO: Use QuadTree, but add an option to use kdTree later
	//this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
	var pointQuad = this.options.pointQuad,
		maxDepth = 16,
		maxChildren = 4;
	this.quadTree = new QuadTree(this.bounds, pointQuad, maxDepth, maxChildren);
	//this.vfield = new VField(this);
	this.wCells.postMessage({"items":this.items});
}
TopologyMaster.prototype.tick = function(t) {
	if(this.isUpdated()){
		this.ready = false;
		var self=this, end = 0;

		end = this.wResult.items.length;
		//if(end > 0)debugger;
		for (i=0; i < end; i++) {
			// TODO: use the class method to draw, but call it as a static method
			// with the parameters required.
			this.items[i].tick(t);
			// TODO: set items.length = wResult.items[i] , then remove this.prune call below
			//this.add( new Particle(this.wResult.items[i]) );
			this.items[i].merge( this.wResult.items[i] );
		}

		//if(end > 0)debugger;
		//var callback = function(i,v){ return i.withinBounds(self.bounds) };
		//if( this.size > 0 ) this.items.filter( callback );// remove from items
		this.update();


		this.prune();

		// Now que updating the information again
		//console.log(this.items);
		//if(this.items.length > 0)debugger;
		//console.log("Ready to calculate particles: ", this.items);
		this.wCells.postMessage({"items":this.items});
		this.vfield.update();
	}
	return this.ready;
}
// Remove all items outside the bounds of the quadtree
TopologyMaster.prototype.prune = function() {
	// Check wether to perform pruning or not. Right now, always preform pruning on update
	//if (to do prune)
	//if (this.size > 100) {
	/*console.log(this.items);
	this.items = this.quadTree.retrieve({x:0,y:0});
	this.size = this.items.length;
	this.update();
	console.log(this.items);
	*/
	//}
	var left = this.bounds.x - 500,
		right = this.bounds.x + this.bounds.width + 500,
		top = this.bounds.y + this.bounds.height + 500,
		bottom = this.bounds.y - 500,
		newItems = this.items;
		i;
	for (i = this.size; --i >= 0; ) {
		if ( this.items[i].x < left)   { newItems.splice(i, 1); } else
		if ( this.items[i].x > right)  { newItems.splice(i, 1); } else
		if ( this.items[i].y < bottom) { newItems.splice(i, 1); } else
		if ( this.items[i].y > top)    { newItems.splice(i, 1); }
	}
	this.items = newItems;
	this.size = this.items.length;
	this.vfield.node.items = this.items;

	// TODO: get all children not in the root, then take them away from the total
	// list, leaving you with all the edge cases. no more checking items well
	// inside the boundary
}
TopologyMaster.prototype.update = function() {
	// Update the QuadTree
	this.quadTree.clear();
	this.quadTree.insert(this.items);

	// FIXME add using quadtree
	/*var nearest = self.mouse==null ? [] :
	self.quadTree.retrieve({x:self.mouse.x,y:self.mouse.y,height:100,width:100});
	var diff = self.root.lastdots.diff(nearest);*/
}
TopologyMaster.prototype.insert = function(item) {
	this.quadTree.insert(item);
}

TopologyMaster.prototype.find = function(bounds) {
	if( this.quadTree ){
		return this.quadTree.retrieve(bounds);
	} else {
		console.error("No quadtree found!",this)
		return [];
	}
}

TopologyMaster.prototype.closestToMouse = function(mouse_pos){
	var candidates = this.find(mouse_pos);
	function m_distance(a,b){
		var ad = a.distance(mouse_pos),
		bd = b.distance(mouse_pos);
		return bd - ad;
	};
	candidates.sort(m_distance);
	return candidates;
}
