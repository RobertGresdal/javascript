/*includeScript(
	    'scripts/QuadTree.js',
	    'scripts/kdTree-min.js',
	    'scripts/js-extensions.js',
	    'scripts/shims.js',
	    'scripts/dot.js',
	    'scripts/Timer.js',
	    'scripts/game.js'
);
*/
importScripts("js-extensions.js", "vfieldnode.js")
var node;

onmessage = function(e) {
	switch(e.data.action) {
		case "update":
			if(!node){
				console.error("Cannot update undefined node!");
				break;
			}
			node.items = e.data.items;
			node.propagate();
			node.resolve();
			break;
		case "init":
			node = new VFieldNode(e.data.dim, e.data.items);
			console.error("Vector field node initialized: ", node)
			break;
		default:
			console.error("Unrecognized message: ", e.data, e)
	}
	postMessage(node);
}
