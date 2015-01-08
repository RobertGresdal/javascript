importScripts("cell.js");
var a = 0;

onmessage = function(e) {
	// TODO: perform bounds checking and pruning here?
	var items, time;
	items = e.data.items;
	time = e.data.time;
//console.log("before",e.data.items[0]);
	if( items ){
		/*if(a < 100){
			//console.log(items);
		}*/
		workOnCells(items, time);
	}
}

function workOnCells(items, time) {
	/*if( items == undefined ){
		console.trace();
		debugger;
	}*/
	var i, end = items.length, /*item,*/ p;
	for (i = 0; i < end; i++) {
		//try {
		//debugger;
			p = new Particle();///*items[i].x, items[i].y, items[i].mass, items[i].vx, items[i].vy*/);
			p.merge(items[i]);
			//p._forces = items[i]._forces;
			//p.merge(items[i]);
			p.tick(time);
			items[i] = p;
			//item = new Particle(items[i]);
			//item.tick(time);
			//items[i] = item;
		//} catch(e){
		//	console.log(items[i], items);
		//	debugger;
		//}
		if(p.x === NaN || items[i].x === NaN)debugger;
	}
  //console.log("cell thread done",items);
	postMessage({"items":items});
}
