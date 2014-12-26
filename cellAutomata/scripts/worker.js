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

function workOnCells(cells) {
	for(var i=0,end=cells.length;i<cells;i++){
		cells[i].tick();
	}
	postMessage("done");
}
