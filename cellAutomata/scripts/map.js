/**
* Lays items out on a 2D surface
*/
function Map(width,height){
	this.items = [];
	this.bounds = {'x':0,'y':0,'width':width,'height':height};
}

Map.prototype.render = function(canvas){
	// TODO: display tree borders
}

/**
* Translates values from a property into something that can be rendered,
* usually as x, y and color space.
*/
Map.prototype.translate = function(){
	// TODO: map to bounds, support zooming etc?
}

Map.prototype.init = function(){
	// TODO: Use QuadTree, but add an option to use kdTree later
	//this.kdTree = new kdTree(this.root.dots, game.distance, ['x','y']);
	var pointQuad = true;
	var maxDepth = 16;
	var maxChildren = 4;
	this.quadTree = new QuadTree(this.bounds, pointQuad, maxDepth, maxChildren);

}
Map.prototype.insert = function(item){
	this.quadTree.insert(item);
}
