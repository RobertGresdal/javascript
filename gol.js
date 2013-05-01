console.log('gol.js');

// global variables prepended with
var _delay = 100;

function init(){
	
	console.log('init');
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	
	//var width=8,height=8;
	// var width=16,height=16;
	// livenodes = [0,1,2,3,8,24,25,33];
	//ln = ln.map(function(i){return i+8});
	// console.log( numberOfNeigbours(9,ln,width,height) );
	// console.log( numberOfNeigbours(4,ln,width,height) );
	// console.log( numberOfNeigbours(7,ln,width,height) );
	// console.log( numberOfNeigbours(16,ln,width,height) );
	
	var width=64,height=64;
	//livenodes = [0,1,64,65,130,131,194,195];
	var livenodes = [];
	for(var i=0,end=width*height;i<end;i++){
		if( Math.random() > 0.3 )livenodes.push(i);
	}
	
	render(livenodes,width,height,context);
	// console.log('livenodes',livenodes);
	//var test = [1,2,3];
	//var interval = window.setInterval(tick, delay);
	var btn = document.getElementById('_tick');
	btn.addEventListener('click',function(){
		// console.log('ln', livenodes);
		livenodes = tick(livenodes,width,height);
		render(livenodes,width,height,context);
	},false);
	
	var btn2 = document.getElementById('start');
	btn2.canvas = canvas;
	btn2.addEventListener('click',function(){
		console.log(livenodes);
	},false);
	// console.log('init end grid.livenodes',livenodes);
}

function render(nodes, width, height, context){
	var _gridsize = 4;
	// clear viewport
	context.fillStyle = 'white';
	context.fillRect(0,0,width*_gridsize,height*_gridsize);
	
	var toCheck = nodesToCheck(nodes,width,height);
	for(var i=0,end=toCheck.length;i<end;i++){
		var x = toCheck[i] % width;
		var y = Math.floor( toCheck[i] / width );
		drawPoint(x,y,_gridsize,context,'#aaffaa');
	}
	
	for(var i=0,end=nodes.length;i<end;i++){
		var x = nodes[i] % width;
		var y = Math.floor( nodes[i] / width );
		drawPoint(x,y,_gridsize,context);
	}
}

function drawPoint(x,y,gridsize,context,color){
	if(!color)color='black';
	if(!gridsize)gridsize = 1;
	if (context){
		//console.log("drawpoint is working");
		context.fillStyle = color;
		context.fillRect(x*gridsize,y*gridsize,gridsize,gridsize);
	}
}

function tick(liveNodes,width,height){
	// console.log('start',liveNodes);
	// var size = width*height;
	
	// rules:
	// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
	// Any live cell with two or three live neighbours lives on to the next generation.
	// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	// Any live cell with more than three live neighbours dies, as if by overcrowding.
	
	// 0-1 : dies
	// 2-3 : no change
	// 3   : creates new live cell
	// 4-8 : dies
	var kill = [];
	var create = [];
	var check = nodesToCheck(liveNodes, width, height);
	
	// Make kill and create list
	for(var i=0,end=check.length;i<end;i++){
		var node = check[i];
		var n = numberOfNeigbours(node,liveNodes,width,height);
		// console.log('node',node,'n',n);
		
		if( n == 3 ) {
			create.push(node);
		} else if( liveNodes.indexOf(node) > -1 ){ // If node is live
			if( n < 2 ) kill.push(node);
			else if ( n > 3 ) kill.push(node);
		}
		// todo, save the index instead and splice from end to zero, will save one indexOf
	}
	
	// Kill nodes
	for(var i=0,end=kill.length;i<end;i++){
		var k = liveNodes.indexOf(kill[i]);
		// console.log('kill', kill[i], 'at index', k);
		//console.log(liveNodes,k);
		liveNodes.splice(k,1);
	}
	// TODO: create nodes
	// console.log('adding nodes',create);
	liveNodes = liveNodes.concat(create);
	liveNodes.sort(compareNumbers).removeDuplicates();
	
	return liveNodes;
}

function nodesToCheck(liveNodes, width, height){
	var toCheck = [].concat(liveNodes);
	
	for(var i=0,end=liveNodes.length; i<end; i++){
		// in addition to self, check points around, unless next to a border
		var pSelf = liveNodes[i];
		var check = getCheckMatrix(pSelf,width,height).map(function(item){return item+pSelf;});
		check.push(pSelf);
		toCheck = toCheck.concat(check);
	}
		
	// sort, then remove all negative and duplicate numbers (in order)
	toCheck.sort(compareNumbers);
	toCheck.removeNegatives().removeDuplicates();
	
	return toCheck;
}

function numberOfNeigbours(position,liveNodes,width,height){
	var check = getCheckMatrix(position,width,height);
	var n = 0; // number of live neigbours
	for(var i=0,end=check.length;i<end;i++){
		// See if the point exist within the list of live nodes
		if( liveNodes.indexOf( position + check[i] ) > -1 ) n++;
	}
	return n;
}

window.addEventListener('load',init,false);