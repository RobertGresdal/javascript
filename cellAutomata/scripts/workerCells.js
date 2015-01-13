importScripts("cell.js");
var a = 0;

onmessage = function(e) {
	// TODO: perform bounds checking and pruning here?
	var items, time;
	items = e.data.items;
	time = e.data.time;
//console.log("before",e.data.items[0]);
	if( items ){
		workOnCells(items, time);
	}
}

function workOnCells(items, time) {
	var i, end = items.length, /*item,*/ p;
	for (i = 0; i < end; i++) {
		p = new Particle();
		p.merge(items[i]);

		p.tick(time);
		items[i] = p;

		if(p.x === NaN || items[i].x === NaN)debugger;
	}
	postMessage({"items":items});
}
